PHB Software Solutions website

Folder structure
  index.html                                   the page
  assets/
    css/styles.css                             all styles
    js/main.js                                 menu, See more/Show less, animations, contact form
    images/
      logos/
        phb-logo-horizontal.webp               header logo
        phb-mark.webp                          footer logo and browser tab icon
        baston-logo-horizontal.webp            BASTON logo on the Products card
      illustrations/
        hero-software-hardware-people.svg      Home hero image
        baston-cane-parts.svg                  labeled cane diagram (Products > See more)
        baston-cane-tilted.svg                 cane shown on the Products card
      team/                                    team photos: pacardo.jpg, huesca.jpg, barbaza.jpg

Upload the whole folder as-is; index.html expects the assets folder beside it.
The small line icons stay inside index.html so they can take on the text color.

Team photos
  To update a photo, replace pacardo.jpg, huesca.jpg or barbaza.jpg in assets/images/team/
  with a 4:5 portrait (about 800 x 1000 px). No code changes are needed.

Contact form
  The form validates input but sends nothing until you connect it. Set data-endpoint on
  <form id="contact-form"> to a form service URL (for example a Formspree endpoint).

Research link
  When a public research document is available, add a "View Research Results" button
  where the comment in the Research section indicates.
