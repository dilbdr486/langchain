import { connectionWeaviate } from "./weaviateCon.js";

export const dataCollection = async () => {
  const client = await connectionWeaviate();

  const srcObjects = [
    {
      title: "The Shawshank Redemption",
      description: "A wrongfully imprisoned man forms an inspiring friendship while finding hope and redemption in the darkest of places."
    },
    {
      title: "The Godfather",
      description: "A powerful mafia family struggles to balance loyalty, power, and betrayal in this iconic crime saga."
    },
    {
      title: "The Dark Knight",
      description: "Batman faces his greatest challenge as he battles the chaos unleashed by the Joker in Gotham City."
    },
    {
      title: "Jingle All the Way",
      description: "A desperate father goes to hilarious lengths to secure the season's hottest toy for his son on Christmas Eve."
    },
    {
      title: "A Christmas Carol",
      description: "A miserly old man is transformed after being visited by three ghosts on Christmas Eve in this timeless tale of redemption."
    }
  ];

  const collectionName = 'dilCollection';
  const myCollection = client.collections.get(collectionName);

  async function insertData() {
    const dataObjects = srcObjects.map(obj => ({
      title: obj.title,
      description: obj.description
    }));

    try {
      const response = await myCollection.data.insertMany(dataObjects);
      console.log(response);
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }

  await insertData();


let result;

result = await myCollection.query.hybrid(
  'what is my name',  // The model provider integration will automatically vectorize the query
  {
    limit: 2,
  }
)

console.log(JSON.stringify({ result: result.objects }, null, 2));

};
