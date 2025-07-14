import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, FileText } from "lucide-react";

interface SummaryOutputProps {
  summary: string[];
  isLoading: boolean;
  model?: string;
  wordCount?: number;
}

export const SummaryOutput = ({ summary, isLoading, model, wordCount }: SummaryOutputProps) => {
  const getSummaryStatus = () => {
    if (isLoading) return "processing";
    if (summary.length > 0) return "completed";
    return "waiting";
  };

  const status = getSummaryStatus();

  const getStatusIcon = () => {
    switch (status) {
      case "processing":
        return <Clock className="h-4 w-4 animate-pulse text-yellow-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "processing":
        return "Processing";
      case "completed":
        return "Complete";
      default:
        return "Ready";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle>Summary Output</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {getStatusText()}
            </Badge>
            {model && status === "completed" && (
              <Badge variant="outline" className="text-xs">
                {model}
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          3-bullet point summary from AI analysis
          {wordCount && ` • Original: ${wordCount} words`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[300px] space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-muted rounded-full"></div>
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <div className="text-center space-y-2">
              <p className="font-medium">Generating summary...</p>
              <p className="text-sm text-muted-foreground">
                AI is analyzing your content and extracting key insights
              </p>
            </div>
          </div>
        ) : summary.length > 0 ? (
          <div className="space-y-6">
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">
                Key Points
              </h4>
              <ul className="space-y-4">
                {summary.map((point, index) => (
                  <li key={index} className="flex items-start space-x-3 group">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-primary-foreground text-xs font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-foreground leading-relaxed flex-1 group-hover:text-primary transition-colors">
                      {point}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
              <span>Generated {summary.length} summary points</span>
              <span>
                {Math.round((summary.join(' ').length / (wordCount || 1)) * 100)}% compression ratio
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-medium text-muted-foreground">
                Summary will appear here
              </p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Connect your input text to the Summarizer LLM block to generate a structured summary
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};