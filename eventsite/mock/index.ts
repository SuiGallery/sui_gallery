const sampleImages = [
    '/sample1.jpg',
    '/sample2.jpg',
    '/sample3.jpg',
  ];
  
  export async function fakePost(prompt: string): Promise<{ data: { url: string }[] }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(prompt);
    // Randomly select an image
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
  
    return {
      data: [{ url: randomImage }]
    };
  }