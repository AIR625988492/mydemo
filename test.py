
# by iReg, v1.7, version date: 2022/3/26from PyPDF2 
import PdfFileWriter, PdfFileReaderimport io from reportlab.pdfgen import canvasfrom reportlab.lib.pagesizes import letterfrom reportlab.pdfbase import pdfmetricsfrom reportlab.pdfbase.ttfonts import TTFontpdfmetrics.registerFont(TTFont('simsun', 'simsun.ttc'))import openpyxl
wb = openpyxl.load_workbook(r'TOC.xlsx') sheet1 = wb['Sheet1']FigureFont = sheet1['D2'].valueFontSize = int(sheet1['E2'].value)LeftMargin = int(sheet1['F2'].value)BottomMargin = int(sheet1['G2'].value)WrapLength = int(sheet1['H2'].value)FigureTitle = []for row in range(2, sheet1.max_row + 1):    FigureTitle.append(sheet1['B' + str(row)].value)
input = PdfFileReader(open(r'Original.pdf', "rb")) output = PdfFileWriter()for i in range(input.getNumPages()):    
    page = input.getPage(i)    rotaion_angle = page.get('/Rotate')    
    packet = io.BytesIO()    
    can = canvas.Canvas(packet)    
    if rotaion_angle:        
        can.setPageRotation(rotaion_angle)    
        else:        
        rotaion_angle = 0 #更正"TypeError: mut be real number, not NoneType"错误    
        if FigureFont == '宋体':        
            can.setFont('simsun', FontSize)    elif FigureFont == 'Times New Roman':        can.setFont('Times-Roman', FontSize)    
            if len(FigureTitle[i]) < WrapLength:        can.drawString(LeftMargin, BottomMargin, FigureTitle[i])    
            elif len(FigureTitle[i]) < (WrapLength * 2): #标题长度大于WrapLength换行        
                can.drawString(LeftMargin, BottomMargin, FigureTitle[i][:WrapLength])        
                can.drawString(LeftMargin, BottomMargin - FontSize, FigureTitle[i][WrapLength:])    
                elif len(FigureTitle[i]) < (WrapLength * 3): 
            #标题长度大于WrapLength*2，再次换行        
            # can.drawString(LeftMargin, BottomMargin, FigureTitle[i][:WrapLength])        
            # can.drawString(LeftMargin, BottomMargin - FontSize, FigureTitle[i][WrapLength:WrapLength*2])        
            # can.drawString(LeftMargin, BottomMargin - FontSize * 2, FigureTitle[i][WrapLength*2:])    c
            # an.save()    packet.seek(0)    new_pdf = PdfFileReader(packet)    
            newpdfWidth = new_pdf.getPage(0).mediaBox.getWidth()    page.mergeRotatedTranslatedPage(new_