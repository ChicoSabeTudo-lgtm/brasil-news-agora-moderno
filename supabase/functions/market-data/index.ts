import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MarketData {
  symbol: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Fetching market data...')
    
    // Buscar dados de diferentes fontes
    const marketData: MarketData[] = []

    // IBOVESPA e outros dados brasileiros via Yahoo Finance
    try {
      const symbols = ['^BVSP', 'USDBRL=X', 'EURBRL=X', 'BTC-USD', 'PETR4.SA', 'VALE3.SA']
      const responses = await Promise.allSettled(
        symbols.map(symbol => 
          fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)
            .then(res => res.json())
        )
      )

      for (let i = 0; i < responses.length; i++) {
        const response = responses[i]
        if (response.status === 'fulfilled' && response.value?.chart?.result?.[0]) {
          const data = response.value.chart.result[0]
          const meta = data.meta
          const current = meta.regularMarketPrice || meta.previousClose
          const previous = meta.previousClose
          const change = current - previous
          const changePercent = (change / previous * 100).toFixed(2)
          
          let symbol: string
          let value: string
          
          switch (symbols[i]) {
            case '^BVSP':
              symbol = 'IBOV'
              value = Math.round(current).toLocaleString('pt-BR')
              break
            case 'USDBRL=X':
              symbol = 'DÓLAR'
              value = `R$ ${current.toFixed(2).replace('.', ',')}`
              break
            case 'EURBRL=X':
              symbol = 'EURO'
              value = `R$ ${current.toFixed(2).replace('.', ',')}`
              break
            case 'BTC-USD':
              symbol = 'BITCOIN'
              value = `US$ ${Math.round(current).toLocaleString('en-US')}`
              break
            case 'PETR4.SA':
              symbol = 'PETRO4'
              value = `R$ ${current.toFixed(2).replace('.', ',')}`
              break
            case 'VALE3.SA':
              symbol = 'VALE3'
              value = `R$ ${current.toFixed(2).replace('.', ',')}`
              break
            default:
              continue
          }

          const trend = change > 0.01 ? 'up' : change < -0.01 ? 'down' : 'neutral'
          const changeStr = `${change >= 0 ? '+' : ''}${changePercent}%`
          
          marketData.push({
            symbol,
            value,
            change: changeStr,
            trend
          })
        }
      }
    } catch (error) {
      console.error('Error fetching Yahoo Finance data:', error)
    }

    // Se não conseguiu dados do Yahoo, usar dados de fallback
    if (marketData.length === 0) {
      console.log('Using fallback market data')
      marketData.push(
        { symbol: "IBOV", value: "125.850", change: "+1.2%", trend: "up" },
        { symbol: "DÓLAR", value: "R$ 5,15", change: "-0.3%", trend: "down" },
        { symbol: "EURO", value: "R$ 5,48", change: "+0.8%", trend: "up" },
        { symbol: "BITCOIN", value: "US$ 43.250", change: "+2.1%", trend: "up" },
        { symbol: "PETRO4", value: "R$ 32,45", change: "0.0%", trend: "neutral" },
        { symbol: "VALE3", value: "R$ 68,90", change: "-1.5%", trend: "down" }
      )
    }

    console.log(`Successfully fetched ${marketData.length} market data points`)

    return new Response(
      JSON.stringify({ data: marketData }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60' // Cache por 1 minuto
        } 
      }
    )

  } catch (error) {
    console.error('Error in market-data function:', error)
    
    // Retornar dados de fallback em caso de erro
    const fallbackData = [
      { symbol: "IBOV", value: "125.850", change: "+1.2%", trend: "up" },
      { symbol: "DÓLAR", value: "R$ 5,15", change: "-0.3%", trend: "down" },
      { symbol: "EURO", value: "R$ 5,48", change: "+0.8%", trend: "up" },
      { symbol: "BITCOIN", value: "US$ 43.250", change: "+2.1%", trend: "up" },
      { symbol: "PETRO4", value: "R$ 32,45", change: "0.0%", trend: "neutral" },
      { symbol: "VALE3", value: "R$ 68,90", change: "-1.5%", trend: "down" }
    ]

    return new Response(
      JSON.stringify({ data: fallbackData }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})