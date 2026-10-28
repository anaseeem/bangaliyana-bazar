// Decoy deck: deliberately ugly. Nothing here follows the site's look.
const pptxgen = require('pptxgenjs')

const pres = new pptxgen()
pres.layout = 'LAYOUT_4x3'
pres.title = 'Bangaliyana Bazar Presentation FINAL'

const W = 10
const BAD = ['Comic Sans MS', 'Papyrus', 'Times New Roman', 'Impact', 'Courier New']
const tb = (s, text, o) => s.addText(text, { isTextBox: true, ...o })

function header(s, title, bg, fg) {
  s.background = { color: bg }
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 1.1, fill: { color: '0000FF' }, line: { color: 'FF0000', width: 6 } })
  tb(s, title, { x: 0.1, y: 0.05, w: W - 0.2, h: 1, fontFace: 'Impact', fontSize: 40, color: fg, align: 'center', shadow: { type: 'outer', color: 'FF00FF', blur: 0, offset: 4, angle: 45, opacity: 1 } })
}

function bullets(s, items, o) {
  tb(s, items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < items.length - 1 } })), {
    x: 0.2, y: 1.2, w: W - 0.4, h: 6, fontSize: 18, valign: 'top', paraSpaceAfter: 0, ...o,
  })
}

// 1. Cover
{
  const s = pres.addSlide()
  s.background = { color: '00FF00' }
  s.addShape(pres.shapes.OVAL, { x: -1, y: -1, w: 5, h: 5, fill: { color: 'FFFF00' }, line: { color: 'FF00FF', width: 8 } })
  s.addShape(pres.shapes.STAR_5_POINT ?? pres.shapes.OVAL, { x: 7.5, y: 4.8, w: 2.5, h: 2.5, fill: { color: 'FF0000' } })
  tb(s, 'WELCOME TO OUR PRESENTATION!!!', { x: 0.2, y: 0.3, w: 9.6, h: 1, fontFace: 'Papyrus', fontSize: 34, color: 'FFFF00', align: 'center' })
  tb(s, 'BANGALIYANA BAZAR', { x: 0, y: 1.6, w: W, h: 1.6, fontFace: 'Impact', fontSize: 66, color: 'FF0000', align: 'center', rotate: -6, shadow: { type: 'outer', color: '0000FF', blur: 0, offset: 6, angle: 45, opacity: 1 } })
  tb(s, 'An E-Commerce Website Project For Selling Products Online Using Modern Web Technologies', { x: 0.5, y: 3.4, w: 9, h: 1, fontFace: 'Comic Sans MS', fontSize: 22, color: '33FF33', align: 'center' })
  tb(s, 'Presented By: Group Members\nCourse Name • Course Code • Section • Semester\nSubmitted To: Honourable Course Instructor\nDate: __/__/____', { x: 0.5, y: 4.6, w: 6.5, h: 2.4, fontFace: 'Times New Roman', fontSize: 20, color: '66FF66' })
}

// 2. Table of contents
{
  const s = pres.addSlide()
  header(s, 'TABLE OF CONTENTS', 'FF99CC', 'FFFF00')
  bullets(s, [
    'Introduction', 'Abstract', 'Objective of the Project', 'Motivation', 'Problem Statement', 'Literature Review',
    'Existing System', 'Proposed System', 'Feasibility Study', 'Requirement Analysis', 'Hardware Requirements',
    'Software Requirements', 'System Design', 'Use Case Diagram', 'ER Diagram', 'Implementation', 'Testing',
    'Advantages', 'Disadvantages', 'Future Scope', 'Conclusion', 'References', 'Thank You',
  ], { fontFace: 'Comic Sans MS', fontSize: 15, color: 'FFCCFF', h: 6.2 })
}

// 3. Introduction: a wall of text
{
  const s = pres.addSlide()
  header(s, 'INTRODUCTION', '000080', '00FFFF')
  tb(s, 'In today\'s modern world of the 21st century, technology is advancing day by day and e-commerce is becoming very much popular among people of all ages. ' +
    'Online shopping has become an essential part of our daily life. Bangaliyana Bazar is an e-commerce website which is developed for selling products online. ' +
    'In this website users can see products, they can add products to cart and they can place order. The website is very user friendly and easy to use. ' +
    'It is made by using many modern technologies. The main purpose of this project is to make an online shop. This project was very helpful for us to learn ' +
    'many new things about web development, teamwork, and time management. We faced many problems while making this project but we solved them all by working hard. ' +
    'We hope that you will like our project and this presentation. In this presentation we will discuss about all the details of our project step by step.',
  { x: 0.15, y: 1.2, w: 9.7, h: 6.2, fontFace: 'Times New Roman', fontSize: 17, color: '0000CC', align: 'justify', valign: 'top' })
}

// 4. Objectives: dark red on red
{
  const s = pres.addSlide()
  header(s, 'OBJECTIVES OF THE PROJECT', 'CC0000', 'FF6666')
  bullets(s, [
    'To develop an e-commerce website.', 'To sell products online.', 'To make the website user friendly.',
    'To make the website easy to use.', 'To learn web development.', 'To learn how to work in a team.',
    'To complete the course requirement.', 'To make the website responsive.', 'To make a good design.',
    'To use modern technology.', 'To get good marks.',
  ], { fontFace: 'Papyrus', fontSize: 22, color: '990000' })
}

// 5. Technologies: logo-less list in a clashing table
{
  const s = pres.addSlide()
  header(s, 'TECHNOLOGIES USED', 'FFFF00', 'FFFFFF')
  const row = (a, b) => [
    { text: a, options: { fill: { color: 'FF00FF' }, color: 'FFFF00', fontFace: 'Comic Sans MS', fontSize: 16 } },
    { text: b, options: { fill: { color: '00FFFF' }, color: 'FFFFFF', fontFace: 'Courier New', fontSize: 14 } },
  ]
  s.addTable([
    row('Frontend', 'HTML, CSS, JavaScript, React, TypeScript, Tailwind'),
    row('Backend', 'Node.js, Fastify'),
    row('Tools', 'VS Code, Git, GitHub, Google Chrome, Laptop'),
    row('Hosting', 'Vercel, Render'),
    row('Other', 'Internet, Electricity, Keyboard, Mouse'),
  ], { x: 0.3, y: 1.4, w: 9.4, colW: [2.4, 7], border: { type: 'solid', color: '000000', pt: 4 }, rowH: 0.9 })
  tb(s, '* all technologies are latest version', { x: 0.3, y: 6.6, w: 9, h: 0.5, fontFace: 'Comic Sans MS', fontSize: 12, color: 'FFFF99' })
}

// 6. Features: congested two columns, grey on grey
{
  const s = pres.addSlide()
  header(s, 'FEATURES', '808080', 'A0A0A0')
  const left = ['Home Page', 'Product Page', 'Cart', 'Order', 'Search', 'Filter', 'Wishlist', 'Login', 'Signup', 'Logout', 'Profile', 'Seller']
  const right = ['Admin', 'Delivery', 'Responsive', 'Fast', 'Secure', 'Beautiful', 'Modern', 'Easy', 'Simple', 'Cheap', 'Bangla', 'Many More...']
  bullets(s, left, { x: 0.2, w: 4.7, fontFace: 'Courier New', fontSize: 20, color: '999999' })
  bullets(s, right, { x: 5.1, w: 4.7, fontFace: 'Courier New', fontSize: 20, color: 'B0B0B0' })
}

// 7. Advantages / disadvantages: neon on neon
{
  const s = pres.addSlide()
  header(s, 'ADVANTAGES & DISADVANTAGES', 'FF6600', '00FF00')
  tb(s, 'ADVANTAGES:', { x: 0.2, y: 1.2, w: 4.7, h: 0.6, fontFace: 'Impact', fontSize: 24, color: 'FFFF00', underline: { style: 'wavy' } })
  bullets(s, ['Saves time', 'Saves money', 'Available 24/7', 'Easy to use', 'No need to go outside'], { x: 0.2, y: 1.8, w: 4.7, fontFace: 'Comic Sans MS', fontSize: 20, color: 'FFCC00' })
  tb(s, 'DISADVANTAGES:', { x: 5.1, y: 1.2, w: 4.7, h: 0.6, fontFace: 'Impact', fontSize: 24, color: 'FF3300', underline: { style: 'wavy' } })
  bullets(s, ['Needs internet', 'Needs electricity', 'Cannot touch product', 'Website can be slow'], { x: 5.1, y: 1.8, w: 4.7, fontFace: 'Comic Sans MS', fontSize: 20, color: 'FF0000' })
}

// 8. Conclusion
{
  const s = pres.addSlide()
  header(s, 'CONCLUSION', '6600CC', 'CC66FF')
  tb(s, 'In conclusion we can say that our project Bangaliyana Bazar is a very good e-commerce website. We have successfully completed our project. ' +
    'We learned many things from this project. In future we will add more features to make it better. Thank you to our honourable course instructor for giving us this opportunity.',
  { x: 0.3, y: 1.3, w: 9.4, h: 5.8, fontFace: 'Papyrus', fontSize: 22, color: '9933FF', align: 'center', valign: 'middle' })
}

// 9. Thank you
{
  const s = pres.addSlide()
  s.background = { color: 'FFFFFF' }
  tb(s, 'THANK YOU!!!', { x: 0, y: 1.2, w: W, h: 2, fontFace: 'Impact', fontSize: 90, color: 'FFFF66', align: 'center', rotate: 8, shadow: { type: 'outer', color: 'EEEEEE', blur: 2, offset: 3, angle: 45, opacity: 1 } })
  tb(s, 'ANY QUESTIONS???', { x: 0, y: 4, w: W, h: 1.2, fontFace: 'Comic Sans MS', fontSize: 40, color: 'CCFFFF', align: 'center' })
  tb(s, '☺ ☺ ☺', { x: 0, y: 5.4, w: W, h: 1, fontFace: BAD[0], fontSize: 40, color: 'FF00FF', align: 'center' })
}

pres.writeFile({ fileName: __dirname + '/Bangaliyana_Bazar_FINAL_final(2).pptx' })
