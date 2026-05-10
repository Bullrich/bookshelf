module.exports = function (eleventyConfig) {
  eleventyConfig.addCollection("books", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/books/*.md")
      .sort((a, b) => new Date(a.data.dateRead) - new Date(b.data.dateRead));
  });

  eleventyConfig.addFilter("monthYear", function (dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  });

  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
};
