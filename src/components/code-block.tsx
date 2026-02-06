"use client";

import { useState } from "react";
import { Braces, Check, Copy } from "lucide-react";
import { FaJsSquare, FaPython, FaPhp } from "react-icons/fa";
import { FaGolang } from "react-icons/fa6";
import { SiRuby } from "react-icons/si";

type Language = "curl" | "javascript" | "python" | "go" | "ruby" | "php";

const CODE_EXAMPLES: Record<Language, React.ReactNode> = {
  curl: (
    <>
      <span className="text-emerald-600">curl</span>
      <span className="text-slate-600"> -X </span>
      <span className="text-amber-600">POST</span>
      <span className="text-sky-600"> https://api.stashfyle.com/v1/upload</span>
      <span className="text-slate-400"> \</span>
      {"\n"}
      <span className="text-slate-600">{"  "}-H </span>
      <span className="text-amber-700">&quot;Authorization: Bearer </span>
      <span className="text-rose-500">YOUR_API_KEY</span>
      <span className="text-amber-700">&quot;</span>
      <span className="text-slate-400"> \</span>
      {"\n"}
      <span className="text-slate-600">{"  "}-F </span>
      <span className="text-amber-700">&quot;file=@/path/to/file&quot;</span>
    </>
  ),
  javascript: (
    <>
      <span className="text-purple-600">const</span>
      <span className="text-slate-700"> formData </span>
      <span className="text-slate-500">= </span>
      <span className="text-purple-600">new</span>
      <span className="text-amber-600"> FormData</span>
      <span className="text-slate-600">();</span>
      {"\n"}
      <span className="text-slate-700">formData</span>
      <span className="text-slate-600">.</span>
      <span className="text-sky-600">append</span>
      <span className="text-slate-600">(</span>
      <span className="text-amber-700">&quot;file&quot;</span>
      <span className="text-slate-600">, </span>
      <span className="text-slate-700">file</span>
      <span className="text-slate-600">);</span>
      {"\n\n"}
      <span className="text-purple-600">const</span>
      <span className="text-slate-700"> response </span>
      <span className="text-slate-500">= </span>
      <span className="text-purple-600">await</span>
      <span className="text-sky-600"> fetch</span>
      <span className="text-slate-600">(</span>
      <span className="text-amber-700">&quot;https://api.stashfyle.com/v1/upload&quot;</span>
      <span className="text-slate-600">, {"{"}</span>
      {"\n"}
      <span className="text-slate-700">{"  "}method</span>
      <span className="text-slate-600">: </span>
      <span className="text-amber-700">&quot;POST&quot;</span>
      <span className="text-slate-600">,</span>
      {"\n"}
      <span className="text-slate-700">{"  "}headers</span>
      <span className="text-slate-600">: {"{"} </span>
      <span className="text-amber-700">&quot;Authorization&quot;</span>
      <span className="text-slate-600">: </span>
      <span className="text-amber-700">&quot;Bearer </span>
      <span className="text-rose-500">YOUR_API_KEY</span>
      <span className="text-amber-700">&quot;</span>
      <span className="text-slate-600"> {"}"},</span>
      {"\n"}
      <span className="text-slate-700">{"  "}body</span>
      <span className="text-slate-600">: </span>
      <span className="text-slate-700">formData</span>
      {"\n"}
      <span className="text-slate-600">{"}"});</span>
    </>
  ),
  python: (
    <>
      <span className="text-purple-600">import</span>
      <span className="text-slate-700"> requests</span>
      {"\n\n"}
      <span className="text-slate-700">response </span>
      <span className="text-slate-500">= </span>
      <span className="text-slate-700">requests</span>
      <span className="text-slate-600">.</span>
      <span className="text-sky-600">post</span>
      <span className="text-slate-600">(</span>
      {"\n"}
      <span className="text-amber-700">{"  "}&quot;https://api.stashfyle.com/v1/upload&quot;</span>
      <span className="text-slate-600">,</span>
      {"\n"}
      <span className="text-slate-700">{"  "}headers</span>
      <span className="text-slate-500">=</span>
      <span className="text-slate-600">{"{"}</span>
      <span className="text-amber-700">&quot;Authorization&quot;</span>
      <span className="text-slate-600">: </span>
      <span className="text-amber-700">&quot;Bearer </span>
      <span className="text-rose-500">YOUR_API_KEY</span>
      <span className="text-amber-700">&quot;</span>
      <span className="text-slate-600">{"}"},</span>
      {"\n"}
      <span className="text-slate-700">{"  "}files</span>
      <span className="text-slate-500">=</span>
      <span className="text-slate-600">{"{"}</span>
      <span className="text-amber-700">&quot;file&quot;</span>
      <span className="text-slate-600">: </span>
      <span className="text-sky-600">open</span>
      <span className="text-slate-600">(</span>
      <span className="text-amber-700">&quot;/path/to/file&quot;</span>
      <span className="text-slate-600">, </span>
      <span className="text-amber-700">&quot;rb&quot;</span>
      <span className="text-slate-600">){"}"}</span>
      {"\n"}
      <span className="text-slate-600">)</span>
    </>
  ),
  go: (
    <>
      <span className="text-purple-600">package</span>
      <span className="text-slate-700"> main</span>
      {"\n\n"}
      <span className="text-slate-700">file</span>
      <span className="text-slate-600">, </span>
      <span className="text-slate-700">_</span>
      <span className="text-slate-500"> := </span>
      <span className="text-slate-700">os</span>
      <span className="text-slate-600">.</span>
      <span className="text-sky-600">Open</span>
      <span className="text-slate-600">(</span>
      <span className="text-amber-700">&quot;/path/to/file&quot;</span>
      <span className="text-slate-600">)</span>
      {"\n"}
      <span className="text-slate-700">body</span>
      <span className="text-slate-500"> := </span>
      <span className="text-slate-600">&amp;</span>
      <span className="text-slate-700">bytes</span>
      <span className="text-slate-600">.</span>
      <span className="text-amber-600">Buffer</span>
      <span className="text-slate-600">{"{}"}</span>
      {"\n"}
      <span className="text-slate-700">writer</span>
      <span className="text-slate-500"> := </span>
      <span className="text-slate-700">multipart</span>
      <span className="text-slate-600">.</span>
      <span className="text-sky-600">NewWriter</span>
      <span className="text-slate-600">(</span>
      <span className="text-slate-700">body</span>
      <span className="text-slate-600">)</span>
      {"\n"}
      <span className="text-slate-700">part</span>
      <span className="text-slate-600">, </span>
      <span className="text-slate-700">_</span>
      <span className="text-slate-500"> := </span>
      <span className="text-slate-700">writer</span>
      <span className="text-slate-600">.</span>
      <span className="text-sky-600">CreateFormFile</span>
      <span className="text-slate-600">(</span>
      <span className="text-amber-700">&quot;file&quot;</span>
      <span className="text-slate-600">, </span>
      <span className="text-amber-700">&quot;file&quot;</span>
      <span className="text-slate-600">)</span>
      {"\n"}
      <span className="text-slate-700">io</span>
      <span className="text-slate-600">.</span>
      <span className="text-sky-600">Copy</span>
      <span className="text-slate-600">(</span>
      <span className="text-slate-700">part</span>
      <span className="text-slate-600">, </span>
      <span className="text-slate-700">file</span>
      <span className="text-slate-600">)</span>
      {"\n\n"}
      <span className="text-slate-700">req</span>
      <span className="text-slate-600">, </span>
      <span className="text-slate-700">_</span>
      <span className="text-slate-500"> := </span>
      <span className="text-slate-700">http</span>
      <span className="text-slate-600">.</span>
      <span className="text-sky-600">NewRequest</span>
      <span className="text-slate-600">(</span>
      <span className="text-amber-700">&quot;POST&quot;</span>
      <span className="text-slate-600">, </span>
      <span className="text-amber-700">&quot;https://api.stashfyle.com/v1/upload&quot;</span>
      <span className="text-slate-600">, </span>
      <span className="text-slate-700">body</span>
      <span className="text-slate-600">)</span>
      {"\n"}
      <span className="text-slate-700">req</span>
      <span className="text-slate-600">.</span>
      <span className="text-slate-700">Header</span>
      <span className="text-slate-600">.</span>
      <span className="text-sky-600">Set</span>
      <span className="text-slate-600">(</span>
      <span className="text-amber-700">&quot;Authorization&quot;</span>
      <span className="text-slate-600">, </span>
      <span className="text-amber-700">&quot;Bearer </span>
      <span className="text-rose-500">YOUR_API_KEY</span>
      <span className="text-amber-700">&quot;</span>
      <span className="text-slate-600">)</span>
    </>
  ),
  ruby: (
    <>
      <span className="text-purple-600">require</span>
      <span className="text-amber-700"> &quot;net/http&quot;</span>
      {"\n"}
      <span className="text-purple-600">require</span>
      <span className="text-amber-700"> &quot;uri&quot;</span>
      {"\n\n"}
      <span className="text-slate-700">uri</span>
      <span className="text-slate-500"> = </span>
      <span className="text-amber-600">URI</span>
      <span className="text-slate-600">.</span>
      <span className="text-sky-600">parse</span>
      <span className="text-slate-600">(</span>
      <span className="text-amber-700">&quot;https://api.stashfyle.com/v1/upload&quot;</span>
      <span className="text-slate-600">)</span>
      {"\n"}
      <span className="text-slate-700">request</span>
      <span className="text-slate-500"> = </span>
      <span className="text-amber-600">Net::HTTP::Post</span>
      <span className="text-slate-600">.</span>
      <span className="text-sky-600">new</span>
      <span className="text-slate-600">(</span>
      <span className="text-slate-700">uri</span>
      <span className="text-slate-600">)</span>
      {"\n"}
      <span className="text-slate-700">request</span>
      <span className="text-slate-600">[</span>
      <span className="text-amber-700">&quot;Authorization&quot;</span>
      <span className="text-slate-600">]</span>
      <span className="text-slate-500"> = </span>
      <span className="text-amber-700">&quot;Bearer </span>
      <span className="text-rose-500">YOUR_API_KEY</span>
      <span className="text-amber-700">&quot;</span>
      {"\n"}
      <span className="text-slate-700">form_data</span>
      <span className="text-slate-500"> = </span>
      <span className="text-slate-600">[[</span>
      <span className="text-amber-700">&quot;file&quot;</span>
      <span className="text-slate-600">, </span>
      <span className="text-amber-600">File</span>
      <span className="text-slate-600">.</span>
      <span className="text-sky-600">open</span>
      <span className="text-slate-600">(</span>
      <span className="text-amber-700">&quot;/path/to/file&quot;</span>
      <span className="text-slate-600">)]]</span>
      {"\n"}
      <span className="text-slate-700">request</span>
      <span className="text-slate-600">.</span>
      <span className="text-sky-600">set_form</span>
      <span className="text-slate-600">(</span>
      <span className="text-slate-700">form_data</span>
      <span className="text-slate-600">, </span>
      <span className="text-amber-700">&quot;multipart/form-data&quot;</span>
      <span className="text-slate-600">)</span>
    </>
  ),
  php: (
    <>
      <span className="text-slate-700">$client</span>
      <span className="text-slate-500"> = </span>
      <span className="text-purple-600">new</span>
      <span className="text-amber-600"> GuzzleHttp\Client</span>
      <span className="text-slate-600">();</span>
      {"\n\n"}
      <span className="text-slate-700">$response</span>
      <span className="text-slate-500"> = </span>
      <span className="text-slate-700">$client</span>
      <span className="text-slate-600">-&gt;</span>
      <span className="text-sky-600">post</span>
      <span className="text-slate-600">(</span>
      {"\n"}
      <span className="text-amber-700">{"  "}&quot;https://api.stashfyle.com/v1/upload&quot;</span>
      <span className="text-slate-600">,</span>
      {"\n"}
      <span className="text-slate-600">{"  "}[</span>
      {"\n"}
      <span className="text-amber-700">{"    "}&quot;headers&quot;</span>
      <span className="text-slate-600"> =&gt; [</span>
      {"\n"}
      <span className="text-amber-700">{"      "}&quot;Authorization&quot;</span>
      <span className="text-slate-600"> =&gt; </span>
      <span className="text-amber-700">&quot;Bearer </span>
      <span className="text-rose-500">YOUR_API_KEY</span>
      <span className="text-amber-700">&quot;</span>
      {"\n"}
      <span className="text-slate-600">{"    "}],</span>
      {"\n"}
      <span className="text-amber-700">{"    "}&quot;multipart&quot;</span>
      <span className="text-slate-600"> =&gt; [</span>
      {"\n"}
      <span className="text-slate-600">{"      "}[</span>
      {"\n"}
      <span className="text-amber-700">{"        "}&quot;name&quot;</span>
      <span className="text-slate-600"> =&gt; </span>
      <span className="text-amber-700">&quot;file&quot;</span>
      <span className="text-slate-600">,</span>
      {"\n"}
      <span className="text-amber-700">{"        "}&quot;contents&quot;</span>
      <span className="text-slate-600"> =&gt; </span>
      <span className="text-sky-600">fopen</span>
      <span className="text-slate-600">(</span>
      <span className="text-amber-700">&quot;/path/to/file&quot;</span>
      <span className="text-slate-600">, </span>
      <span className="text-amber-700">&quot;r&quot;</span>
      <span className="text-slate-600">)</span>
      {"\n"}
      <span className="text-slate-600">{"      "}]</span>
      {"\n"}
      <span className="text-slate-600">{"    "}]</span>
      {"\n"}
      <span className="text-slate-600">{"  "}]</span>
      {"\n"}
      <span className="text-slate-600">);</span>
    </>
  ),
};

const CODE_TEXT: Record<Language, string> = {
  curl: `curl -X POST https://api.stashfyle.com/v1/upload \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@/path/to/file"`,
  javascript: `const formData = new FormData();
formData.append("file", file);

const response = await fetch("https://api.stashfyle.com/v1/upload", {
  method: "POST",
  headers: { "Authorization": "Bearer YOUR_API_KEY" },
  body: formData
});`,
  python: `import requests

response = requests.post(
  "https://api.stashfyle.com/v1/upload",
  headers={"Authorization": "Bearer YOUR_API_KEY"},
  files={"file": open("/path/to/file", "rb")}
)`,
  go: `package main

file, _ := os.Open("/path/to/file")
body := &bytes.Buffer{}
writer := multipart.NewWriter(body)
part, _ := writer.CreateFormFile("file", "file")
io.Copy(part, file)

req, _ := http.NewRequest("POST", "https://api.stashfyle.com/v1/upload", body)
req.Header.Set("Authorization", "Bearer YOUR_API_KEY")`,
  ruby: `require "net/http"
require "uri"

uri = URI.parse("https://api.stashfyle.com/v1/upload")
request = Net::HTTP::Post.new(uri)
request["Authorization"] = "Bearer YOUR_API_KEY"
form_data = [["file", File.open("/path/to/file")]]
request.set_form(form_data, "multipart/form-data")`,
  php: `$client = new GuzzleHttp\\Client();

$response = $client->post(
  "https://api.stashfyle.com/v1/upload",
  [
    "headers" => [
      "Authorization" => "Bearer YOUR_API_KEY"
    ],
    "multipart" => [
      [
        "name" => "file",
        "contents" => fopen("/path/to/file", "r")
      ]
    ]
  ]
);`,
};

const TABS: { id: Language; label: string; icon: React.ReactNode }[] = [
  { id: "curl", label: "cURL", icon: <Braces className="h-3.5 w-3.5" /> },
  { id: "javascript", label: "JavaScript", icon: <FaJsSquare className="h-3.5 w-3.5" /> },
  { id: "python", label: "Python", icon: <FaPython className="h-3.5 w-3.5" /> },
  { id: "go", label: "Go", icon: <FaGolang className="h-3.5 w-3.5" /> },
  { id: "ruby", label: "Ruby", icon: <SiRuby className="h-3.5 w-3.5" /> },
  { id: "php", label: "PHP", icon: <FaPhp className="h-3.5 w-3.5" /> },
];

export function CodeBlock() {
  const [activeTab, setActiveTab] = useState<Language>("curl");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(CODE_TEXT[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex border-b border-border bg-muted/50">
        <div className="flex flex-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-background text-foreground border-b-2 border-primary -mb-px"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <div className="p-4 bg-muted/30 overflow-x-auto" style={{ fontFamily: "'Inconsolata', monospace" }}>
        <pre className="text-sm leading-relaxed">
          {CODE_EXAMPLES[activeTab]}
        </pre>
      </div>
    </div>
  );
}
