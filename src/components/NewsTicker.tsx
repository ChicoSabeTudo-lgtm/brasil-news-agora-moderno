import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const marketData = [
  { symbol: "IBOV", value: "125.850", change: "+1.2%", trend: "up" },
  { symbol: "DÓLAR", value: "R$ 5,15", change: "-0.3%", trend: "down" },
  { symbol: "EURO", value: "R$ 5,48", change: "+0.8%", trend: "up" },
  { symbol: "BITCOIN", value: "US$ 43.250", change: "+2.1%", trend: "up" },
  { symbol: "PETRO4", value: "R$ 32,45", change: "0.0%", trend: "neutral" },
  { symbol: "VALE3", value: "R$ 68,90", change: "-1.5%", trend: "down" },
];

const breakingNews = [
  "Congresso aprova nova lei de incentivo tecnológico",
  "Banco Central mantém taxa de juros em 10,75%",
  "Brasil registra menor taxa de desemprego em 5 anos",
];

export const NewsTicker = () => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case "down":
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-500";
      case "down":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="bg-news-ticker text-white border-b border-gray-700">
      {/* Breaking News Ticker */}
      <div className="border-b border-gray-600 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <div className="bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide mr-4">
              Breaking
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="animate-marquee whitespace-nowrap">
                {breakingNews.map((news, index) => (
                  <span key={index} className="text-sm mr-8">
                    {news}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Data Ticker */}
      <div className="py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between overflow-x-auto">
            <div className="flex items-center space-x-6 min-w-max">
              {marketData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <span className="font-medium text-gray-300">{item.symbol}</span>
                  <span className="text-white">{item.value}</span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(item.trend)}
                    <span className={getTrendColor(item.trend)}>{item.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};