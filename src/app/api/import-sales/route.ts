import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type ImportRow = {
  date: string
  time?: string
  receipt_id?: string
  table_id?: string
  raw_dish_name: string
  menu_item_id: string | null
  quantity: number
  unit_price?: number
  revenue: number
  cost?: number
}

type NewAlias = {
  alias_name: string
  menu_item_id: string
}

export async function POST(req: NextRequest) {
  try {
    const { source, rows, newAliases } = await req.json() as {
      source: string
      rows: ImportRow[]
      newAliases: NewAlias[]
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'No rows to import' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Save new aliases
    if (newAliases.length > 0) {
      await supabase
        .from('menu_item_aliases')
        .upsert(
          newAliases.map((a) => ({ alias_name: a.alias_name, menu_item_id: a.menu_item_id })),
          { onConflict: 'alias_name' }
        )
    }

    // 2. Compute date range and stats
    const dates = rows.map((r) => r.date).filter(Boolean).sort()
    const matchedCount = rows.filter((r) => r.menu_item_id).length

    // 3. Create import record
    const { data: importRecord, error: importError } = await supabase
      .from('sales_imports')
      .insert({
        source_filename: source,
        row_count: rows.length,
        matched_count: matchedCount,
        date_from: dates[0] ?? null,
        date_to: dates[dates.length - 1] ?? null,
      })
      .select('id')
      .single()

    if (importError || !importRecord) {
      return NextResponse.json({ error: importError?.message ?? 'Failed to create import record' }, { status: 500 })
    }

    const importId = importRecord.id

    // 4. Group rows into transactions by (date, receipt_id)
    const transactionMap = new Map<string, {
      receipt_id?: string
      date: string
      time?: string
      table_id?: string
      items: ImportRow[]
    }>()

    for (const row of rows) {
      const key = row.receipt_id
        ? `${row.date}::${row.receipt_id}`
        : `${row.date}::${row.table_id ?? ''}::${row.raw_dish_name}::${Math.random()}`
      if (!transactionMap.has(key)) {
        transactionMap.set(key, {
          receipt_id: row.receipt_id || undefined,
          date: row.date,
          time: row.time || undefined,
          table_id: row.table_id || undefined,
          items: [],
        })
      }
      transactionMap.get(key)!.items.push(row)
    }

    // 5. Insert transactions batch
    const transactionRows = Array.from(transactionMap.values()).map((t) => ({
      import_id: importId,
      receipt_id: t.receipt_id ?? null,
      date: t.date,
      time: t.time ?? null,
      table_id: t.table_id ?? null,
    }))

    const { data: insertedTransactions, error: txError } = await supabase
      .from('sales_transactions')
      .insert(transactionRows)
      .select('id')

    if (txError || !insertedTransactions) {
      return NextResponse.json({ error: txError?.message ?? 'Failed to insert transactions' }, { status: 500 })
    }

    // 6. Insert sales items — map each row to its transaction
    const transactionKeys = Array.from(transactionMap.keys())
    const itemRows: object[] = []

    let txIndex = 0
    for (const [, tx] of transactionMap) {
      const transactionId = insertedTransactions[txIndex]?.id
      txIndex++
      if (!transactionId) continue

      for (const item of tx.items) {
        itemRows.push({
          transaction_id: transactionId,
          menu_item_id: item.menu_item_id ?? null,
          raw_dish_name: item.raw_dish_name,
          quantity: item.quantity,
          unit_price: item.unit_price ?? null,
          revenue: item.revenue,
          cost: item.cost ?? null,
        })
      }
    }

    // Supabase recommends batches of 1000
    for (let i = 0; i < itemRows.length; i += 1000) {
      const batch = itemRows.slice(i, i + 1000)
      const { error: itemError } = await supabase.from('sales_items').insert(batch)
      if (itemError) {
        return NextResponse.json({ error: itemError.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      imported: rows.length,
      matched: matchedCount,
      transactions: insertedTransactions.length,
    })
  } catch (err) {
    console.error('import-sales error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Unused variable suppression
void String
