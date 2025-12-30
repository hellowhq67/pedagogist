import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Mic,
  PenTool,
  ChevronDown,
  ChevronRight,
  Volume2,
  Image,
  MessageSquare,
  HelpCircle,
  FileText,
  Users,
  Mail,
  Edit3,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { speakingQuestions, TestType, getTestTypeInfo } from "@/data/speakingQuestions";
import { writingQuestions, WritingTestType, getWritingTestTypeInfo } from "@/data/writingQuestions";
import { readingQuestions, ReadingTestType, getReadingTestTypeInfo } from "@/data/readingQuestions";
import { listeningQuestions, ListeningTestType, getListeningTestTypeInfo } from "@/data/listeningQuestions";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type SectionType = "speaking" | "writing" | "reading" | "listening";
type AllTestTypes = TestType | WritingTestType | ReadingTestType | ListeningTestType;

interface AppSidebarProps {
  selectedSection: SectionType;
  selectedType: AllTestTypes | null;
  onSelectSection: (section: SectionType) => void;
  onSelectType: (type: AllTestTypes) => void;
}

const speakingTestTypes: TestType[] = [
  "read-aloud",
  "repeat-sentence",
  "describe-image",
  "retell-lecture",
  "answer-short-question",
  "summarize-spoken-text",
  "read-and-retell",
  "summarize-group-discussion",
  "respond-to-situation",
];

const writingTestTypes: WritingTestType[] = [
  "summarize-written-text",
  "write-essay",
  "summarize-written-text-core",
  "write-email",
];

const readingTestTypes: ReadingTestType[] = [
  "mc-single",
  "mc-multiple",
  "reorder-paragraphs",
  "fill-blanks-drag",
  "fill-blanks-dropdown",
];

const listeningTestTypes: ListeningTestType[] = [
  "highlight-correct-summary",
  "mc-single-listening",
  "mc-multiple-listening",
  "fill-blanks-listening",
  "highlight-incorrect-words",
  "write-from-dictation",
  "select-missing-word",
  "summarize-spoken-text",
];

const getIconForTestType = (type: AllTestTypes) => {
  const iconMap: Record<string, React.ReactNode> = {
    "read-aloud": <BookOpen className="h-4 w-4" />,
    "repeat-sentence": <Volume2 className="h-4 w-4" />,
    "describe-image": <Image className="h-4 w-4" />,
    "retell-lecture": <Mic className="h-4 w-4" />,
    "answer-short-question": <HelpCircle className="h-4 w-4" />,
    "summarize-spoken-text": <FileText className="h-4 w-4" />,
    "read-and-retell": <BookOpen className="h-4 w-4" />,
    "summarize-group-discussion": <Users className="h-4 w-4" />,
    "respond-to-situation": <MessageSquare className="h-4 w-4" />,
    "summarize-written-text": <FileText className="h-4 w-4" />,
    "write-essay": <Edit3 className="h-4 w-4" />,
    "summarize-written-text-core": <FileText className="h-4 w-4" />,
    "write-email": <Mail className="h-4 w-4" />,
    // Reading types
    "mc-single": <HelpCircle className="h-4 w-4" />,
    "mc-multiple": <HelpCircle className="h-4 w-4" />,
    "reorder-paragraphs": <FileText className="h-4 w-4" />,
    "fill-blanks-drag": <Edit3 className="h-4 w-4" />,
    "fill-blanks-dropdown": <Edit3 className="h-4 w-4" />,
    // Listening types
    "highlight-correct-summary": <FileText className="h-4 w-4" />,
    "mc-single-listening": <HelpCircle className="h-4 w-4" />,
    "mc-multiple-listening": <HelpCircle className="h-4 w-4" />,
    "fill-blanks-listening": <Edit3 className="h-4 w-4" />,
    "highlight-incorrect-words": <BookOpen className="h-4 w-4" />,
    "write-from-dictation": <Edit3 className="h-4 w-4" />,
    "select-missing-word": <Volume2 className="h-4 w-4" />,
  };
  return iconMap[type] || <BookOpen className="h-4 w-4" />;
};

export function AppSidebar({
  selectedSection,
  selectedType,
  onSelectSection,
  onSelectType,
}: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [speakingOpen, setSpeakingOpen] = useState(selectedSection === "speaking");
  const [writingOpen, setWritingOpen] = useState(selectedSection === "writing");
  const [readingOpen, setReadingOpen] = useState(selectedSection === "reading");
  const [listeningOpen, setListeningOpen] = useState(selectedSection === "listening");

  const getSpeakingCount = (type: TestType) => {
    return speakingQuestions.filter(q => q.type === type).length;
  };

  const getWritingCount = (type: WritingTestType) => {
    return writingQuestions.filter(q => q.type === type).length;
  };

  const getReadingCount = (type: ReadingTestType) => {
    return readingQuestions.filter(q => q.type === type).length;
  };

  const getListeningCount = (type: ListeningTestType) => {
    return listeningQuestions.filter(q => q.type === type).length;
  };

  return (
    <Sidebar className={cn("border-r", collapsed ? "w-14" : "w-64")} collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg">PTE Practice</h1>
              <p className="text-xs text-muted-foreground">Academic & Core</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Speaking Section */}
        <Collapsible open={speakingOpen} onOpenChange={setSpeakingOpen}>
          <SidebarGroup>
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-primary" />
                  {!collapsed && <span>Speaking</span>}
                </div>
                {!collapsed && (
                  speakingOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {speakingTestTypes.map((type) => {
                    const info = getTestTypeInfo(type);
                    const count = getSpeakingCount(type);
                    const isActive = selectedSection === "speaking" && selectedType === type;

                    return (
                      <SidebarMenuItem key={type}>
                        <SidebarMenuButton
                          onClick={() => {
                            onSelectSection("speaking");
                            onSelectType(type);
                          }}
                          className={cn(
                            "w-full justify-between",
                            isActive && "bg-primary/10 text-primary font-medium"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {getIconForTestType(type)}
                            {!collapsed && <span className="text-sm">{info.name}</span>}
                          </div>
                          {!collapsed && (
                            <Badge variant="secondary" className="text-xs">
                              {count}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Writing Section */}
        <Collapsible open={writingOpen} onOpenChange={setWritingOpen}>
          <SidebarGroup>
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <PenTool className="h-4 w-4 text-accent" />
                  {!collapsed && <span>Writing</span>}
                </div>
                {!collapsed && (
                  writingOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {writingTestTypes.map((type) => {
                    const info = getWritingTestTypeInfo(type);
                    const count = getWritingCount(type);
                    const isActive = selectedSection === "writing" && selectedType === type;

                    return (
                      <SidebarMenuItem key={type}>
                        <SidebarMenuButton
                          onClick={() => {
                            onSelectSection("writing");
                            onSelectType(type);
                          }}
                          className={cn(
                            "w-full justify-between",
                            isActive && "bg-accent/10 text-accent font-medium"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {getIconForTestType(type)}
                            {!collapsed && <span className="text-sm">{info.name}</span>}
                          </div>
                          {!collapsed && (
                            <Badge variant="secondary" className="text-xs">
                              {count}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        {/* Reading Section */}
        <Collapsible open={readingOpen} onOpenChange={setReadingOpen}>
          <SidebarGroup>
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-500" />
                  {!collapsed && <span>Reading</span>}
                </div>
                {!collapsed && (
                  readingOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {readingTestTypes.map((type) => {
                    const info = getReadingTestTypeInfo(type);
                    const count = getReadingCount(type);
                    const isActive = selectedSection === "reading" && selectedType === type;

                    return (
                      <SidebarMenuItem key={type}>
                        <SidebarMenuButton
                          onClick={() => {
                            onSelectSection("reading");
                            onSelectType(type);
                          }}
                          className={cn(
                            "w-full justify-between",
                            isActive && "bg-emerald-500/10 text-emerald-500 font-medium"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {getIconForTestType(type)}
                            {!collapsed && <span className="text-sm">{info.name}</span>}
                          </div>
                          {!collapsed && (
                            <Badge variant="secondary" className="text-xs">
                              {count}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Listening Section */}
        <Collapsible open={listeningOpen} onOpenChange={setListeningOpen}>
          <SidebarGroup>
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-blue-500" />
                  {!collapsed && <span>Listening</span>}
                </div>
                {!collapsed && (
                  listeningOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {listeningTestTypes.map((type) => {
                    const info = getListeningTestTypeInfo(type);
                    const count = getListeningCount(type);
                    const isActive = selectedSection === "listening" && selectedType === type;

                    return (
                      <SidebarMenuItem key={type}>
                        <SidebarMenuButton
                          onClick={() => {
                            onSelectSection("listening");
                            onSelectType(type);
                          }}
                          className={cn(
                            "w-full justify-between",
                            isActive && "bg-blue-500/10 text-blue-500 font-medium"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {getIconForTestType(type)}
                            {!collapsed && <span className="text-sm">{info.name}</span>}
                          </div>
                          {!collapsed && (
                            <Badge variant="secondary" className="text-xs">
                              {count}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
    </Sidebar>
  );
}
