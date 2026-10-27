// The image files already have their captions baked in (that's how memes
// work), so we only store who posted it, what folder/topic it's under,
// and the upvote count — no separate caption text is duplicated in the UI.
export const INITIAL_MEMES = [
  { id: 1, author: "Simran Gill", topic: "Exams", image: "/memes/close-eyes-pov.jpg", upvotes: 421, saved: false },
  { id: 2, author: "Harnoor Singh", topic: "Placements", image: "/memes/graduation-unemployed.jpg", upvotes: 604, saved: false },
  { id: 3, author: "Devansh Rana", topic: "Campus Life", image: "/memes/lets-get-this-degree.jpg", upvotes: 389, saved: false },
  { id: 4, author: "Priya Nair", topic: "Campus Life", image: "/memes/avoid-family-gatherings.jpg", upvotes: 456, saved: false },
  { id: 5, author: "Kabir Anand", topic: "Exams", image: "/memes/sweet-dreams-pov.jpg", upvotes: 312, saved: false },
  { id: 6, author: "Tanvi Oberoi", topic: "Placements", image: "/memes/interviewer-wallet.jpg", upvotes: 530, saved: false },
];
