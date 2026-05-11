module.exports = function (eleventyConfig) {
  function parseBookDate(str) {
    const parts = String(str).split("-");
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
  }

  eleventyConfig.addCollection("books", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/books/*.md")
      .sort((a, b) => parseBookDate(b.data.dateRead) - parseBookDate(a.data.dateRead));
  });

  eleventyConfig.addFilter("monthYear", function (dateStr) {
    const d = parseBookDate(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  });

  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
};
