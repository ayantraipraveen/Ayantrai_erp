import sys
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from PIL import Image

img = Image.open('extracted_pages/page_03.png').convert('RGB')
w, h = img.size

def safe_getpixel(x, y):
    cx = max(0, min(w - 1, int(x)))
    cy = max(0, min(h - 1, int(y)))
    return img.getpixel((cx, cy))

def is_tinted(r, g, b, thresh=250):
    return r < thresh or g < thresh or b < thresh

print("=" * 70)
print(f"PAGE 3 CANVAS MEASUREMENT REPORT (Source: Dummy_report.pdf, Page 3)")
print(f"Image Resolution: {w}px × {h}px (A4 Aspect Ratio: 1 : {h/w:.3f})")
print("=" * 70)

left_content = 52
right_content = 1055
content_w = right_content - left_content
print(f"Content Boundaries:")
print(f"  Left Margin:   {left_content}px ({left_content/w*100:.1f}%)")
print(f"  Right Margin:  {w - right_content}px ({(w - right_content)/w*100:.1f}%)")
print(f"  Content Width: {content_w}px ({content_w/w*100:.1f}%)")

print("\n" + "-" * 70)
print("1. SECTION TITLE & METADATA BLOCK")
print("-" * 70)
print("Eyebrow ('PROJECT OVERVIEW'):")
print("  Font: Sans-serif, Bold, Uppercase, Tracking +0.15em")
print("  Height: ~14px (scaled css: text-[12px] / font-bold / text-slate-500)")

print("Title ('Key Metrics This Month'):")
print("  Font: Bold/Black, ~40px cap height (scaled css: text-[34px] to text-[36px] font-black)")
print("  Colors: 'Key Metrics ' -> #0f172a (dark navy), 'This Month' -> #2563eb (bright blue)")

print("Description ('A snapshot of your site’s safety, compliance and device performance.'):")
print("  Font: Regular/Medium, ~16px (scaled css: text-[14px] text-slate-600)")

print("Project / Site Info Box (Top Right):")
print("  Width:  ~336px (33.5% of content width)")
print("  Height: ~86px")
print("  Background: #eff4fa with subtle border (#e2e8f0)")
print("  Border Radius: ~12px (rounded-xl)")
print("  Content: 2 rows with blue icon badges (Building2 & Calendar)")

r1_top = 325
r1_bottom = 540
card_h1 = r1_bottom - r1_top

r2_top = 556
r2_bottom = 771
card_h2 = r2_bottom - r2_top
row_gap = r2_top - r1_bottom

card_cols = []
in_card = False
start_x = 0
for x in range(left_content, right_content):
    r, g, b = safe_getpixel(x, r1_top + 30)
    is_c = is_tinted(r, g, b, 252)
    if is_c and not in_card:
        in_card = True
        start_x = x
    elif not is_c and in_card:
        in_card = False
        card_cols.append((start_x, x))

if in_card:
    card_cols.append((start_x, right_content))

print("\n" + "-" * 70)
print("2. 8 METRIC CARDS GRID (4 Columns × 2 Rows)")
print("-" * 70)
print(f"Row 1: Height = {card_h1}px (~215px)")
print(f"Row 2: Height = {card_h2}px (~215px)")
print(f"Row Gap (Vertical spacing): {row_gap}px (~16px / gap-4)")

print("\nDetected Columns:")
for i, (cx1, cx2) in enumerate(card_cols):
    cw = cx2 - cx1
    gap = card_cols[i+1][0] - cx2 if i + 1 < len(card_cols) else 0
    print(f"  Col {i+1}: Width = {cw}px ({cw/content_w*100:.1f}%), Gap to next = {gap}px")

print("\nCard Internal Layout & Typography:")
print("  - Padding: ~20px (p-5)")
print("  - Border Radius: ~16px (rounded-2xl)")
print("  - Icon Badge: 44px × 44px circular badge (rounded-full), top-left aligned")
print("  - Metric Label: ~13px - 14px font (font-bold text-slate-800, 2-line cap)")
print("  - Metric Value: ~34px font-black (font-black text-slate-900, tracking-tight)")
print("  - Trend Line: ~13px bold font with trend subtitle (vs. last month)")

cards_data = [
    ("Card 1: Monthly Attendance Rate", 0, r1_top, r1_bottom, "Users", "92.4%", "+2.1%"),
    ("Card 2: Monthly Compliance Rate", 1, r1_top, r1_bottom, "ShieldCheck", "96.8%", "+3.6%"),
    ("Card 3: Total Devices Sent to Site", 2, r1_top, r1_bottom, "Package", "300", "No change"),
    ("Card 4: Damaged Devices This Month", 3, r1_top, r1_bottom, "AlertTriangle", "5", "+2 (Red)"),
    ("Card 5: Risk-Free Working Hours", 0, r2_top, r2_bottom, "Clock", "18,450 hrs", "+12%"),
    ("Card 6: Monthly Supervisory Efficiency", 1, r2_top, r2_bottom, "UserCheck", "89.2%", "+4.5%"),
    ("Card 7: Total Runtime of Devices", 2, r2_top, r2_bottom, "Settings", "26,340 hrs", "+8%"),
    ("Card 8: Overtime of Devices", 3, r2_top, r2_bottom, "History", "320 hrs", "-28% (Green)"),
]

print("\nCard Visual Palette (Exact sampled hex codes):")
for name, col_idx, y1, y2, icon, val, trend in cards_data:
    if col_idx < len(card_cols):
        cx1, cx2 = card_cols[col_idx]
        bg_rgb = safe_getpixel(cx2 - 20, y2 - 20)
        badge_rgb = bg_rgb
        min_brightness = 999
        for by in range(y1 + 15, y1 + 50):
            for bx in range(cx1 + 15, cx1 + 50):
                p = safe_getpixel(bx, by)
                br = sum(p)
                if 200 < br < min_brightness and br < sum(bg_rgb) - 30:
                    min_brightness = br
                    badge_rgb = p

        print(f"  - {name}:")
        print(f"      Card Background: #{bg_rgb[0]:02x}{bg_rgb[1]:02x}{bg_rgb[2]:02x}")
        print(f"      Icon Circle Bg:  #{badge_rgb[0]:02x}{badge_rgb[1]:02x}{badge_rgb[2]:02x}")
        print(f"      Value: {val} | Trend: {trend}")

kt_top = 790
kt_bottom = 1130
kt_h = kt_bottom - kt_top
print("\n" + "-" * 70)
print("3. KEY TAKEAWAYS BLOCK")
print("-" * 70)
print(f"Container Position: y={kt_top}px to {kt_bottom}px")
print(f"Container Height:   {kt_h}px")
print(f"Container Width:    {content_w}px (full content width)")
kt_bg = safe_getpixel(left_content + 30, kt_top + 30)
print(f"Container Background: #{kt_bg[0]:02x}{kt_bg[1]:02x}{kt_bg[2]:02x}")
print(f"Border Radius: ~16px (rounded-2xl) with subtle border")
print("Header:")
print("  - Icon: Blue document icon in rounded square (FileText)")
print("  - Title: 'Key Takeaways' (~18px font-bold, dark navy)")
print("  - Divider: 1px light horizontal rule across full width")
print("Items (8 Numbered Takeaways):")
print("  - Number Badge: 24px diameter circular pill with colored number (1 to 8)")
print("  - Item Title: font-bold text-slate-800 (~13px)")
print("  - Item Body: font-normal text-slate-600 (~13px)")
print("  - Row spacing: ~8px gap between items")
print("=" * 70)
