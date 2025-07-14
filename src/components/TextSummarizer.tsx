import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader, Settings, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Summarizer } from "./Summarizer";
import { SummaryOutput } from "./SummaryOutput";

export const TextSummarizer = () => {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState<'gpt-4o' | 'gpt-3.5-turbo'>('gpt-4o');
  const { toast } = useToast();
  const summarizerRef = useRef<Summarizer | null>(null);
  const [wordCount, setWordCount] = useState(0);

  const initializeSummarizer = () => {
    if (!summarizerRef.current && apiKey.trim()) {
      summarizerRef.current = new Summarizer({
        apiKey: apiKey.trim(),
        model: selectedModel
      });
    } else if (summarizerRef.current) {
      summarizerRef.current.updateConfig({
        apiKey: apiKey.trim(),
        model: selectedModel
      });
    }
  };

  const summarizeText = async () => {
    // Calculate word count
    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to summarize.",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your OpenAI API key.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSummary([]);

    try {
      // Initialize or update the summarizer
      initializeSummarizer();
      
      if (!summarizerRef.current) {
        throw new Error("Failed to initialize summarizer");
      }

      const result = await summarizerRef.current.generateSummary(inputText);

      if (result.success) {
        setSummary(result.summary);
        toast({
          title: "Success",
          description: `Text summarized successfully using ${selectedModel}!`,
        });
      } else {
        throw new Error(result.error || "Summarization failed");
      }
    } catch (error) {
      console.error('Error summarizing text:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to summarize text. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Text Summarizer</h1>
        </div>
        <p className="text-muted-foreground">
          Transform long articles and essays into clean 3-bullet summaries using advanced AI models
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Summarizer Configuration</CardTitle>
            </div>
            <CardDescription>
              Configure your AI model and paste your content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model-select">AI Model</Label>
              <Select value={selectedModel} onValueChange={(value: 'gpt-4o' | 'gpt-3.5-turbo') => setSelectedModel(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4 (Recommended)</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">OpenAI API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally and never sent to our servers
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="input-text">Text to Summarize</Label>
              <Textarea
                id="input-text"
                placeholder="Paste your article or essay here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[300px] resize-y"
              />
            </div>
            
            <Button 
              onClick={summarizeText} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Processing with {selectedModel}...
                </>
              ) : (
                `Generate Summary with ${selectedModel}`
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Summary Output Block */}
        <SummaryOutput 
          summary={summary}
          isLoading={isLoading}
          model={selectedModel}
          wordCount={wordCount}
        />
      </div>

      {/* Info Section */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Connected Blocks:</strong> Input Block → Summarizer LLM Block → Summary Output Block
            </p>
            <p>
              The Summary Output block displays processed results from the Summarizer with status indicators, model information, and compression metrics. For secure API key storage and backend functionality, consider connecting to Supabase.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};