import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Eye, Code } from "lucide-react";
import { useState } from "react";

interface EmailTemplate {
  key: string;
  name: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  variables?: string[];
}

interface TemplateEditorProps {
  template?: EmailTemplate;
  onSave?: (template: EmailTemplate) => void;
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    key: "order_confirmation",
    name: "Potvrda narudžbe",
    subject: "Narudžba #{order_id} je potvrđena",
    htmlBody: `<h1>Narudžba potvrđena</h1>
<p>Vaša narudžba #{order_id} za {amount} KM je potvrđena.</p>
<p><a href="{order_url}">Pogledaj narudžbu</a></p>`,
    textBody: "Narudžba #{order_id} je potvrđena za {amount} KM",
    variables: ["order_id", "amount", "order_url"],
  },
  {
    key: "review_received",
    name: "Primljena recenzija",
    subject: "Nova recenzija na {listing_title}",
    htmlBody: `<h1>Nova recenzija</h1>
<p>{reviewer_name} je ostavio recenziju na vašoj stavki {listing_title}.</p>
<p>Ocjena: {rating}/5</p>`,
    textBody: "{reviewer_name} je recenzirao: {listing_title}",
    variables: ["reviewer_name", "listing_title", "rating"],
  },
  {
    key: "message_received",
    name: "Nova poruka",
    subject: "Nova poruka od {sender_name}",
    htmlBody: `<h1>Nova poruka</h1>
<p>Primili ste novu poruku od {sender_name}.</p>
<p>Poruka: {message_preview}</p>`,
    textBody: "Nova poruka od {sender_name}",
    variables: ["sender_name", "message_preview"],
  },
];

export function TemplateEditor({ template, onSave }: TemplateEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(
    template || null
  );
  const [viewMode, setViewMode] = useState<"editor" | "preview">("editor");
  const [htmlContent, setHtmlContent] = useState(
    template?.htmlBody || ""
  );
  const [textContent, setTextContent] = useState(
    template?.textBody || ""
  );

  const handleSelectTemplate = (tpl: EmailTemplate) => {
    setSelectedTemplate(tpl);
    setHtmlContent(tpl.htmlBody);
    setTextContent(tpl.textBody || "");
  };

  const handleSave = () => {
    if (selectedTemplate) {
      const updated = {
        ...selectedTemplate,
        htmlBody: htmlContent,
        textBody: textContent,
      };
      onSave?.(updated);
    }
  };

  const extractVariables = (text: string) => {
    const matches = text.match(/\{(\w+)\}/g) || [];
    return [...new Set(matches.map((m) => m.slice(1, -1)))];
  };

  const variables = extractVariables(
    selectedTemplate?.subject + htmlContent + textContent
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Uređivač šablona
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Kreirajte i prilagodite email šablone
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template List */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Dostupni šabloni</h4>
          {DEFAULT_TEMPLATES.map((tpl) => (
            <button
              key={tpl.key}
              onClick={() => handleSelectTemplate(tpl)}
              className={`w-full text-left px-3 py-2 rounded border transition ${
                selectedTemplate?.key === tpl.key
                  ? "bg-blue-50 border-blue-300"
                  : "bg-gray-50 border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="font-medium text-sm">{tpl.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {tpl.key}
              </p>
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="lg:col-span-3 space-y-4">
          {selectedTemplate ? (
            <>
              {/* View Mode Tabs */}
              <div className="flex gap-2 border-b">
                <button
                  onClick={() => setViewMode("editor")}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                    viewMode === "editor"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Code className="h-4 w-4 inline mr-2" />
                  Uređivač
                </button>
                <button
                  onClick={() => setViewMode("preview")}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                    viewMode === "preview"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="h-4 w-4 inline mr-2" />
                  Pretpregled
                </button>
              </div>

              {/* Editor Mode */}
              {viewMode === "editor" && (
                <Card className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Naziv šablona
                    </label>
                    <Input
                      value={selectedTemplate.name}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Subjekt
                    </label>
                    <Input
                      value={selectedTemplate.subject}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      HTML sadržaj
                    </label>
                    <textarea
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      className="w-full h-48 px-3 py-2 border rounded font-mono text-sm"
                      placeholder="<h1>Naslov</h1><p>Sadržaj...</p>"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Koristite {"{variable}"} za dinamičke vrijednosti
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tekstualni sadržaj
                    </label>
                    <textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      className="w-full h-32 px-3 py-2 border rounded font-mono text-sm"
                      placeholder="Tekstualna verzija email poruke..."
                    />
                  </div>

                  {variables.length > 0 && (
                    <Card className="p-3 bg-blue-50 border-blue-200">
                      <p className="text-sm font-medium mb-2">
                        Dostupne varijable:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {variables.map((v) => (
                          <span
                            key={v}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-200 text-blue-900"
                          >
                            {"{"}
                            {v}
                            {"}"}
                          </span>
                        ))}
                      </div>
                    </Card>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="flex-1">
                      Spremi šablon
                    </Button>
                  </div>
                </Card>
              )}

              {/* Preview Mode */}
              {viewMode === "preview" && (
                <Card className="p-4 space-y-4">
                  <div className="bg-white border rounded p-4">
                    <div className="mb-4 pb-4 border-b">
                      <p className="text-xs text-muted-foreground">Subjekt:</p>
                      <p className="font-semibold">
                        {selectedTemplate.subject}
                      </p>
                    </div>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: htmlContent.replace(
                          /\{(\w+)\}/g,
                          '<span class="bg-yellow-100 px-1 rounded">[$1]</span>'
                        ),
                      }}
                    />
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              Odaberite šablon za uređivanje
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
