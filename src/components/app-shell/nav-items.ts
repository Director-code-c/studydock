import {
  FileStackIcon,
  FolderOpenIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  SearchIcon,
  SettingsIcon,
  Trash2Icon,
} from "lucide-react"

export const appNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/courses", label: "Courses", icon: FolderOpenIcon },
  { href: "/projects", label: "Projects", icon: ListChecksIcon },
  { href: "/files", label: "Files", icon: FileStackIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/trash", label: "Trash", icon: Trash2Icon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
]
