import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 8080,
      allowedHosts: ["sb-2082vfrd3p3r.vercel.run"],
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    envPrefix: "VITE_RUNTIME_",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env.VITE_RUNTIME_SUPABASE_URL": JSON.stringify(
        env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL,
      ),
      "import.meta.env.VITE_RUNTIME_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        env.SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      ),
    },
  };
});
