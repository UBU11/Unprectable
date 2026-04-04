'use client';

import Link from 'next/link';
import {
  Brain,
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  Zap,
  Eye,
  FileJson,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: FileText,
    title: 'Paste or Upload',
    description: 'Paste any documentation text or upload PDF, Markdown, TXT, or CSV files.'
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Analysis',
    description: 'AI analyzes your content and extracts key concepts automatically.'
  },
  {
    icon: Brain,
    title: 'Interactive Mind Maps',
    description: 'Visualize complex documentation as interactive, navigable mind maps.'
  },
  {
    icon: Zap,
    title: 'Map-Reduce for Large Docs',
    description: 'Automatically processes large documents in chunks for comprehensive results.'
  }
];

const supportedFormats = [
  { icon: FileText, label: 'PDF', color: 'text-red-400' },
  { icon: FileText, label: 'Markdown', color: 'text-blue-400' },
  { icon: FileText, label: 'TXT', color: 'text-slate-400' },
  { icon: FileJson, label: 'CSV', color: 'text-green-400' }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold">DocToMap</span>
          </div>
          <Link href="/mindmap">
            <Button>
              Open App <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Documentation Visualizer
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Transform Dense Docs into
              <span className="text-primary"> Visual Mind Maps</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Paste documentation, upload files, or enter any technical text.
              Our AI instantly creates interactive mind maps to help you understand and navigate complex concepts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/mindmap">
                <Button size="lg" className="min-w-[200px]">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="min-w-[200px]">
                  Learn More <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Formats */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-6">
            Supports multiple document formats
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {supportedFormats.map((format) => (
              <div key={format.label} className="flex items-center gap-2">
                <format.icon className={`h-5 w-5 ${format.color}`} />
                <span className="text-sm font-medium">{format.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Turn any documentation into an interactive visual experience in just a few clicks
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-muted">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className="aspect-video relative bg-gradient-to-br from-purple-950/50 to-slate-950 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div className="flex justify-center gap-8">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="px-4 py-3 rounded-xl border-2 border-purple-400/50 bg-purple-950/80 backdrop-blur-sm"
                      >
                        <div className="text-sm text-purple-200 font-medium">Concept {i}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <div className="h-px w-16 bg-purple-500/30" />
                    <div className="px-4 py-2 rounded-xl border-2 border-purple-400 bg-purple-950/90">
                      <div className="text-sm text-purple-200 font-bold">Main Topic</div>
                    </div>
                    <div className="h-px w-16 bg-purple-500/30" />
                  </div>
                  <div className="flex justify-center gap-8 pt-4">
                    {[4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="px-4 py-3 rounded-xl border-2 border-purple-400/50 bg-purple-950/80 backdrop-blur-sm"
                      >
                        <div className="text-sm text-purple-200 font-medium">Concept {i}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-2 text-purple-400/60 text-sm">
                  <Eye className="h-4 w-4" /> Interactive Preview
                </div>
              </div>
              <div className="p-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-2">Interactive Mind Maps</h3>
                <p className="text-muted-foreground">
                  Pan, zoom, and explore your documentation visually. Click nodes to expand connections
                  and drill down into specific concepts.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to visualize your documentation?</h2>
            <p className="text-muted-foreground mb-8">
              Transform any technical content into an interactive mind map in seconds.
            </p>
            <Link href="/mindmap">
              <Button size="lg">
                Start Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="h-4 w-4" />
              <span>DocToMap - Visual Learning Platform</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Powered by UBU
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
