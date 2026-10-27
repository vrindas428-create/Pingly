// Kept intentionally small — two seeded items so the page never looks
// empty, plus whatever students add through the form (which also
// supports attaching a photo, stored as a data URL via FileReader, and a
// way to contact whoever posted it).
export const INITIAL_LOSTFOUND = [
  {
    id: 1,
    kind: "Lost",
    item: "Student ID card (CSE)",
    place: "Cafeteria",
    image: "/lostfound/id-card.jpg",
    contact: "aryan.malhotra@chitkara.edu.in",
  },
  {
    id: 2,
    kind: "Found",
    item: "Blue water bottle (Owala)",
    place: "Library, 2nd floor",
    image: "/lostfound/water-bottle.jpg",
    contact: "9876543210",
  },
];
