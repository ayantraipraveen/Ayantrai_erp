import pymupdf

doc = pymupdf.open('frontend/public/Dummy_report.pdf')
page = doc[2]
print('Images in page 3:', page.get_images())
blocks = page.get_text('dict')['blocks']
for b in blocks:
    print('Block keys:', b.keys(), 'type:', b.get('type'))
