import { DashboardHeader } from "@/components/DashboardHeader";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PDFExportPanel } from "@/components/exports/PDFExportPanel";
import { RecordingsManager } from "@/components/recordings/RecordingsManager";
import { FileText, Video } from "lucide-react";

export default function Integrations() {
  return (
    <Layout>
      <div className="space-y-6">
        <DashboardHeader 
          title="Integrations & Storage"
          description="Manage exports, recordings, and file storage"
        />

        <Tabs defaultValue="exports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="exports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              PDF Exports
            </TabsTrigger>
            <TabsTrigger value="recordings" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Recordings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exports">
            <PDFExportPanel />
          </TabsContent>

          <TabsContent value="recordings">
            <RecordingsManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}