"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const themeOptions = [
  { value: "light", label: "浅色", icon: SunIcon },
  { value: "dark", label: "深色", icon: MoonIcon },
  { value: "system", label: "跟随系统", icon: MonitorIcon },
] as const

// Hydration-safe mount detection: server renders `false`, client flips to
// `true` after hydration without a cascading setState in an effect.
const emptySubscribe = () => () => {}
const getMountedSnapshot = () => true
const getServerSnapshot = () => false

export function ThemeToggle() {
  const mounted = useSyncExternalStore(emptySubscribe, getMountedSnapshot, getServerSnapshot)
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="切换主题">
          <span className="relative flex size-4 items-center justify-center">
            <SunIcon
              className="size-4 rotate-0 scale-100 transition-transform duration-200 dark:-rotate-90 dark:scale-0"
              aria-hidden="true"
            />
            <MoonIcon
              className="absolute size-4 rotate-90 scale-0 transition-transform duration-200 dark:rotate-0 dark:scale-100"
              aria-hidden="true"
            />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-32">
        {themeOptions.map((option) => {
          const Icon = option.icon
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => setTheme(option.value)}
              aria-current={mounted && theme === option.value}
            >
              <Icon aria-hidden="true" />
              {option.label}
              {mounted && theme === option.value && (
                <CheckIcon className="ml-auto text-brand" aria-hidden="true" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
