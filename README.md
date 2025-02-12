# WallFetch

WallFetch is a web application that allows users to fetch and view images from a specific GitHub repository folder. By providing a GitHub folder URL, users can instantly view and access images stored within that folder, directly from their browser.

## Features

- Fetch images from a GitHub repository folder by providing a URL.
- Display the repository owner's details (avatar and name).
- Grid view to showcase the images.
- Click on an image to open it in a new tab.

## Demo

You can check out a live demo of WallFetch [here](https://wallfetch.vercel.app/).

## Technologies Used

- **React** - Frontend library for building the user interface.
- **Next.js** - React framework for server-side rendering.
- **Framer Motion** - For smooth animations and transitions.
- **Tailwind CSS** - Utility-first CSS framework for styling.
- **GitHub API** - To fetch the contents of the GitHub repository folder.

## Installation

Clone this repository to your local machine:

```bash
git clone https://github.com/your-username/wallfetch.git
```

Navigate to the project directory:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

## Usage

1. Copy the GitHub folder URL of the repository you want to fetch images from.
2. Paste the URL into the input field on the WallFetch home page.
3. Click the Fetch button to load images from the provided folder.
4. View and click on the images to open them in a new tab.
