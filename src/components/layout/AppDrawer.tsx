import React, { useState, useEffect } from "react"
import { ALL_NAV_LINKS } from "@/constants/navLinks"
import { EssentialLink } from "./EssentialLink"

interface AppDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const AppDrawer: React.FC<AppDrawerProps> = ({ isOpen, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Desktop sidebar wrapper classes
  const desktopWidthClass = isExpanded ? "w-60" : "w-14"

  if (isMobile) {
    return (
      <>
        {/* Backdrop for mobile */}
        {isOpen && (
          <div 
            onClick={onClose} 
            className="fixed inset-0 bg-black/45 z-[1040] animate-in fade-in duration-200"
          />
        )}
        
        {/* Mobile drawer panel */}
        <aside
          className={`fixed top-0 left-0 bottom-0 z-[1050] w-60 bg-gradient-to-b from-[#f5f7fb] via-[#ffffff] to-[#f5f7fb] border-r border-slate-200/60 flex flex-col p-2.5 shadow-2xl transition-transform duration-350 ease-out select-none ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header area in mobile drawer for context */}
          <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-100 mb-3">
            <span className="text-base font-bold text-slate-800 tracking-tight">MECMS Menu</span>
          </div>

          <nav className="flex-1 overflow-y-auto pr-0.5 custom-scrollbar flex flex-col gap-0.5">
            {ALL_NAV_LINKS.map((link) => (
              <EssentialLink
                key={link.title}
                {...link}
                compact={false}
              />
            ))}
          </nav>
        </aside>
      </>
    )
  }

  // Desktop hover-expandable sidebar
  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`sticky top-[50px] h-[calc(100vh-50px)] shrink-0 bg-gradient-to-b from-[#f5f7fb] via-[#ffffff] to-[#f5f7fb] border-r border-slate-200/50 flex flex-col pt-3 pb-2 transition-all duration-300 cubic-bezier(0.25, 0.8, 0.25, 1) z-[990] select-none ${desktopWidthClass} ${
        isExpanded ? "overflow-y-auto overflow-x-hidden" : "overflow-visible"
      }`}
    >
      <nav className={`flex-1 pr-0.5 custom-scrollbar flex flex-col gap-0.5 ${
        isExpanded ? "overflow-y-auto overflow-x-hidden" : "overflow-visible"
      }`}>
        {ALL_NAV_LINKS.map((link) => (
          <EssentialLink
            key={link.title}
            {...link}
            compact={!isExpanded}
          />
        ))}
      </nav>
    </aside>
  )
}
