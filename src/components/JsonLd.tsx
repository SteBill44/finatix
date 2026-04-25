import { useEffect } from "react";

interface JsonLdProps {
  schema: Record<string, unknown> | Record<string, unknown>[];
  id?: string;
}

const JsonLd = ({ schema, id = "json-ld" }: JsonLdProps) => {
  useEffect(() => {
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(Array.isArray(schema) ? schema : schema);
    document.head.appendChild(script);

    return () => {
      document.getElementById(id)?.remove();
    };
  }, [schema, id]);

  return null;
};

export default JsonLd;
