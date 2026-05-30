import React, { useState, useMemo } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { ChevronDown, type LucideIcon } from "lucide-react"

export interface EssentialLinkProps {
  title: string
  caption?: string
  link?: string
  icon: LucideIcon
  compact?: boolean
  children?: EssentialLinkProps[]
}

export const EssentialLink: React.FC<EssentialLinkProps> = ({
  title,
  caption = "",
  link = "",
  icon: Icon,
  compact = false,
  children
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname
  const currentSearch = location.search

  // Check if link itself is active
  const isSelfActive = useMemo(() => {
    if (!link || children?.length) return false
    const [path, query] = link.split("?")
    if (currentPath !== path) return false
    if (query) {
      const searchParams = new URLSearchParams(query)
      const currentParams = new URLSearchParams(currentSearch)
      let matches = true
      searchParams.forEach((value, key) => {
        if (currentParams.get(key) !== value) {
          matches = false
        }
      })
      return matches
    }
    return true
  }, [link, children, currentPath, currentSearch])

  // Check if any of children links is active
  const isChildActive = useMemo(() => {
    if (!children) return false
    return children.some((child) => {
      if (!child.link) return false
      const [path, query] = child.link.split("?")
      if (currentPath !== path) return false
      if (query) {
        const searchParams = new URLSearchParams(query)
        const currentParams = new URLSearchParams(currentSearch)
        let matches = true
        searchParams.forEach((value, key) => {
          if (currentParams.get(key) !== value) {
            matches = false
          }
        })
        return matches
      }
      return true
    })
  }, [children, currentPath, currentSearch])

  // Sub-menu open state (default open if a child is active)
  const [isOpen, setIsOpen] = useState(isChildActive)
  const [prevIsChildActive, setPrevIsChildActive] = useState(isChildActive)

  if (isChildActive !== prevIsChildActive) {
    setPrevIsChildActive(isChildActive)
    if (isChildActive) {
      setIsOpen(true)
    }
  }

  const navigateTo = (targetLink?: string) => {
    if (!targetLink) return
    if (targetLink.startsWith("http")) {
      window.open(targetLink, "_blank")
    } else {
      navigate(targetLink)
    }
  }

  // --- RENDER GROUP / SUB-MENU ITEM ---
  if (children && children.length > 0) {
    return (
      <div className={`relative group/tooltip select-none mb-1.5 rounded-xl overflow-visible transition-all duration-300 ${compact ? "mx-0" : "mx-1.5"}`}>
        {/* Accordion header button */}
        <button
          onClick={() => {
            if (!compact) {
              setIsOpen(!isOpen)
            }
          }}
          className={`flex items-center h-11 rounded-[10px] text-left transition-all duration-200 ${
            compact 
              ? "justify-center w-11 mx-auto px-0 cursor-default" 
              : "justify-between w-full px-1.5 cursor-pointer"
          } ${
            isChildActive
              ? compact
                ? "bg-[#088395] text-white shadow-sm"
                : "text-[#088395] bg-[#088395]/10"
              : "text-slate-700 hover:bg-[#088395]/10 hover:text-[#088395]"
          }`}
        >
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 shrink-0 transition-all duration-300 ${compact ? "ml-0" : "ml-1"}`}>
              <Icon className={`size-[22px] shrink-0 ${isChildActive && compact ? "text-white" : ""}`} />
            </div>
            <div
              className={`flex flex-col transition-all duration-300 ease-in-out origin-left ${
                compact ? "w-0 opacity-0 pointer-events-none overflow-hidden scale-x-0 ml-0" : "w-auto opacity-100 scale-x-100 ml-3"
              }`}
            >
              <span className="text-[13px] font-semibold leading-tight whitespace-nowrap">{title}</span>
              {caption && (
                <span className="text-[9.5px] text-slate-500 font-normal leading-tight mt-0.5 whitespace-nowrap">
                  {caption}
                </span>
              )}
            </div>
          </div>

          {/* Chevron icon */}
          {!compact && (
            <ChevronDown
              className={`size-4 text-slate-455 transition-all duration-250 mr-2 shrink-0 ${
                isOpen ? "rotate-180 text-[#088395]" : "rotate-0"
              }`}
            />
          )}
        </button>

        {/* Inline Expandable Children (Desktop expanded mode) */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            !compact && isOpen ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="pl-4 pr-1 py-1 flex flex-col gap-1.5 bg-slate-50/60 rounded-xl border border-slate-100/50">
              {children.map((child) => (
                <EssentialLink
                  key={child.title}
                  {...child}
                  compact={false}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Floating popup submenu (Desktop collapsed compact mode) */}
        {compact && (
          <div className="absolute left-[100%] top-1/2 -translate-y-1/2 ml-2.5 hidden group-hover/tooltip:flex flex-col bg-slate-900/95 text-white rounded-xl p-2.5 z-[1010] min-w-48 shadow-xl border border-slate-700/50 pointer-events-auto after:content-[''] after:absolute after:-left-3 after:top-0 after:bottom-0 after:w-3">
            <div className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1 px-2.5 whitespace-nowrap">
              {title}
            </div>
            <div className="h-[1px] bg-white/10 my-1.5 mx-1" />
            <div className="flex flex-col gap-0.5">
              {children.map((child) => {
                const ChildIcon = child.icon
                const isChildSelfActive =
                  child.link && currentPath === child.link.split("?")[0]
                return (
                  <button
                    key={child.title}
                    onClick={(e) => {
                      e.stopPropagation()
                      navigateTo(child.link)
                    }}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-left transition-colors cursor-pointer w-full whitespace-nowrap ${
                      isChildSelfActive
                        ? "bg-[#088395] text-white"
                        : "text-white/90 hover:bg-white/10"
                    }`}
                  >
                    <ChildIcon className="size-4 shrink-0" />
                    <span>{child.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // --- RENDER REGULAR LINK ITEM ---
  return (
    <div className={`relative group/tooltip select-none mb-1.5 rounded-xl overflow-visible transition-all duration-300 ${compact ? "mx-0" : "mx-1.5"}`}>
      <Link
        to={link}
        className={`flex items-center h-11 transition-all duration-200 cursor-pointer rounded-[10px] ${
          compact
            ? "justify-center w-11 mx-auto px-0"
            : "justify-start px-1.5 w-full"
        } ${
          isSelfActive
            ? compact
              ? "bg-[#088395] text-white shadow-sm"
              : "bg-[#088395]/15 text-[#088395] font-semibold"
            : "text-slate-700 hover:bg-[#088395]/10 hover:text-[#088395]"
        }`}
      >
        {/* Icon wrapper */}
        <div className={`flex items-center justify-center w-8 h-8 shrink-0 transition-all duration-300 ${compact ? "ml-0" : "ml-1"}`}>
          <Icon 
            className={`size-[22px] shrink-0 transition-colors duration-200 ${
              isSelfActive
                ? compact
                  ? "text-white"
                  : "text-[#088395]"
                : "text-slate-405 group-hover:text-[#088395]"
            }`} 
          />
        </div>

        {/* Text container */}
        <div
          className={`flex flex-col transition-all duration-300 ease-in-out origin-left ${
            compact ? "w-0 opacity-0 pointer-events-none overflow-hidden scale-x-0 ml-0" : "w-auto opacity-100 scale-x-100 ml-3"
          }`}
        >
          <span className="text-[13px] font-semibold leading-tight whitespace-nowrap">{title}</span>
          {caption && (
            <span className={`text-[9.5px] font-normal leading-tight mt-0.5 whitespace-nowrap ${
              isSelfActive ? "text-[#088395]/80" : "text-slate-500"
            }`}>
              {caption}
            </span>
          )}
        </div>
      </Link>

      {/* Floating tooltip for regular link in compact mode */}
      {compact && (
        <div className="absolute left-[100%] top-1/2 -translate-y-1/2 ml-2.5 hidden group-hover/tooltip:block bg-slate-900/95 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold z-[1010] shadow-md border border-slate-700/50 pointer-events-none whitespace-nowrap">
          {title}
        </div>
      )}
    </div>
  )
}
