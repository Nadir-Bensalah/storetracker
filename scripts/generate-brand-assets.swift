// Renders the app icon and splash marks from the bundled Newsreader font, so the
// brand assets can be regenerated instead of living as opaque binaries.
// Usage: swift scripts/generate-brand-assets.swift
import AppKit
import CoreText

let ink = NSColor(srgbRed: 0x15 / 255, green: 0x17 / 255, blue: 0x1C / 255, alpha: 1)
let paper = NSColor(srgbRed: 0xF4 / 255, green: 0xEF / 255, blue: 0xE7 / 255, alpha: 1)

let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
let fontURL = root.appendingPathComponent("assets/fonts/Newsreader16pt-Medium.ttf") as CFURL
CTFontManagerRegisterFontsForURL(fontURL, .process, nil)

func render(_ name: String, size: CGFloat, background: NSColor?, glyph: NSColor, glyphScale: CGFloat) {
  let rep = NSBitmapImageRep(
    bitmapDataPlanes: nil, pixelsWide: Int(size), pixelsHigh: Int(size), bitsPerSample: 8,
    samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
    colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
  if let background {
    background.setFill()
    NSRect(x: 0, y: 0, width: size, height: size).fill()
  }
  let font = NSFont(name: "Newsreader16pt-Medium", size: size * glyphScale)!
  let text = NSAttributedString(string: "S", attributes: [.font: font, .foregroundColor: glyph])
  let line = CTLineCreateWithAttributedString(text)
  let bounds = CTLineGetBoundsWithOptions(line, .useGlyphPathBounds)
  let context = NSGraphicsContext.current!.cgContext
  context.textPosition = CGPoint(x: (size - bounds.width) / 2 - bounds.minX, y: (size - bounds.height) / 2 - bounds.minY)
  CTLineDraw(line, context)
  NSGraphicsContext.restoreGraphicsState()
  let data = rep.representation(using: .png, properties: [:])!
  try! data.write(to: root.appendingPathComponent("assets/\(name).png"))
}

render("icon", size: 1024, background: ink, glyph: paper, glyphScale: 0.62)
render("android-icon-background", size: 1024, background: ink, glyph: ink, glyphScale: 0.01)
// Adaptive icons are masked to the central 66%, hence the smaller glyph.
render("android-icon-foreground", size: 1024, background: nil, glyph: paper, glyphScale: 0.42)
render("android-icon-monochrome", size: 1024, background: nil, glyph: .white, glyphScale: 0.42)
render("splash-icon", size: 512, background: nil, glyph: ink, glyphScale: 0.62)
render("splash-icon-dark", size: 512, background: nil, glyph: paper, glyphScale: 0.62)
