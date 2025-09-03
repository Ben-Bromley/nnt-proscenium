---
title: Editing the Wiki
description: The New Theatre Wiki is a collaborative resource that anyone can help improve! Whether you're fixing a typo, adding new information, or creating entirely new pages, your contributions help keep our community informed.
---

## Quick Start

Every wiki page has two buttons at the bottom:

- **"Edit this page"** - Opens the page file on GitHub where you can make changes directly
- **"Suggest an edit"** - Creates a GitHub issue if you want to suggest changes without editing yourself

Don't worry if you're not familiar with GitHub - this page will guide you through everything!

## Understanding the Page Structure

Each wiki page is written in **Markdown**, a simple text formatting language that's easy to learn. Here's what a typical page looks like:

```md
<!-- This is a comment explaining what this page is about -->

Your content goes here using **bold text**, *italic text*, and [links](https://example.com).

## Section Heading

More content here...

### Subsection

- Bullet point 1
- Bullet point 2
- Bullet point 3
```

## Formatting Guide

### Text Formatting

```md
**Bold text** - Use for emphasis and important terms
*Italic text* - Use for emphasis or book/show titles
***Bold and italic*** - Use sparingly for strong emphasis
~~Strikethrough~~ - Use for outdated information you want to show as changed
```

### Headings

```md
## Major Section
### Subsection
#### Minor Section
##### Smallest Section
```

**Important:** Don't use `#` (main title) headings in wiki pages. The page title comes from the frontmatter. Start your first heading with `##`.

### Lists

**Bullet Lists:**
```md
- First item
- Second item
  - Nested item (use 2 spaces)
  - Another nested item
- Third item
```

**Numbered Lists:**
```md
1. First step
2. Second step
3. Third step
```

### Links

```md
[Link text](https://example.com) - External links
[Internal page](/wiki/getting-started/about) - Links to other wiki pages
[Email link](mailto:someone@example.com) - Email addresses
```

**Tip:** For wiki pages, use the full path starting with `/wiki/`

### Images

```md
![Alt text](image-url.jpg)
```

Note: Images should be uploaded to the `/public/images/` folder first.

### Code and Technical Content

For inline code: `use backticks`

For code blocks:
````md
```
Multi-line code
goes here
```
````

### Tables

```md
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | More     |
| Row 2    | Data     | More     |
```

### Quotes and Callouts

```md
> This is a quote or important callout
> It can span multiple lines
```

## Content Guidelines

### Writing Style

- **Be clear and concise** - Write for someone who might be new to the theatre
- **Use active voice** - "We meet on Mondays" instead of "Meetings are held on Mondays"
- **Define technical terms** - Not everyone knows theatre or administrative jargon
- **Stay current** - Remove outdated information and add dates where relevant

### What to Include

**Good content includes:**
- Step-by-step instructions
- Contact information and who to ask for help
- Deadlines and important dates
- Links to relevant resources
- Real examples where helpful

**Avoid:**
- Personal opinions (unless it's a personal account/story)
- Temporary information better suited for announcements
- Content that duplicates other pages
- Broken links or outdated contact details

### Tone and Voice

- **Friendly and welcoming** - Remember, someone might be reading this on their first day
- **Inclusive** - Use language that welcomes everyone
- **Helpful** - Think about what questions someone might have
- **Professional but not stuffy** - We're students, let's sound like it!

## Page Organisation

### File Structure

Wiki pages are organised in folders:

```
/wiki/
├── getting-started/     # New member information
├── productions/         # Show-related processes
├── technical/           # Technical theatre information
├── governance/          # Committee and administrative info
├── community/           # Social events and traditions
└── website/             # Website and wiki help
```

### Creating New Pages

To create a new page, you'll need to:

1. Decide which category it belongs in
2. Create a new `.md` file in the appropriate folder
3. Give it a clear, descriptive filename (use lowercase and hyphens)
4. Add the content following the formatting guidelines above

**Example:** A page about sound equipment would be `/wiki/technical/departments/sound/equipment.md`

## Comments and Planning

Use HTML comments to add notes that won't appear on the public page:

```md
<!-- This section needs updating after the next committee meeting -->

<!-- TODO: Add contact details for the new treasurer -->

<!-- This information is from 2024 - check if still current -->
```

These are helpful for:
- Planning future updates
- Explaining why certain information is included
- Noting what needs verification
- Coordinating with other editors

## Getting Help

### For New Editors

- Start with small edits like fixing typos or updating contact information
- Look at existing pages to understand the style and format
- Don't worry about making mistakes - everything can be undone!
- Ask for help in the committee chat or email the webmaster

### For Technical Issues

If you're having trouble with:
- **GitHub** - Ask the archivist or someone technical on committee
- **Markdown formatting** - Check this guide or search "Markdown tutorial" online
- **Page organisation** - Discuss with committee where new content should go
- **Content questions** - Ask the relevant committee member or officer

### Review Process

All changes go through a review process:

1. You make your edit on GitHub
2. Someone with access reviews the change
3. Once approved, it appears on the website

This ensures quality and prevents spam, but it means changes aren't instant.

## Best Practices

### Before You Edit

- **Read the existing page** - Understand the current structure and style
- **Check for recent changes** - Someone might have just updated what you want to change
- **Consider the audience** - Who will be reading this page?

### While Editing

- **Make one logical change at a time** - Don't mix unrelated edits
- **Use clear edit messages** - Explain what you changed and why
- **Preview when possible** - GitHub shows a preview of how your changes will look
- **Check your links** - Make sure any links you add actually work

### After Editing

- **Check the live page** - Once your edit is approved, make sure it looks right
- **Update related pages** - If you change contact details, check if they appear elsewhere
- **Tell relevant people** - Let committee members know about significant updates

## Examples

### Adding a New Committee Role

```markdown
## Social Secretary

**Contact:** [social@newtheatre.org.uk](mailto:social@newtheatre.org.uk)

**Responsibilities:**
- Organise social events throughout the year

**When to contact:** For event planning, social media content, or party bookings.
```

### Updating Process Information

```markdown
## Booking Rehearsal Rooms

**Updated:** September 2025

1. **Check availability** on the [booking calendar](/calendar)
2. **Email the theatre manager** at [theatremanager@newtheatre.org.uk](mailto:theatremanager@newtheatre.org.uk)
3. **Include these details:**
   - Show name and director
   - Preferred dates and times
   - Room requirements (mirrors, piano, etc.)
4. **Wait for confirmation** before assuming your booking is confirmed
5. **Add to your calendar** and share with your team

**Booking deadline:** 2 weeks before you need the room
**Cancellation policy:** 48 hours notice required
```

## Remember

The wiki is here to help our community - every improvement, no matter how small, makes a difference. Don't be afraid to contribute, and thank you for helping keep our information up to date!

---

**Need more help?** Contact [archivist@newtheatre.org.uk](mailto:archivist@newtheatre.org.uk) or ask in the committee chat.