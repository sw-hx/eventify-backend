import patternChecker from "./patternCheckerHelperFunction.js";

const buildPaginationMeta = (count, limit, page, rows) => {
  patternChecker.verifyNotNegative(count, "count");
  patternChecker.verifyNotNegative(limit, "limit");
  patternChecker.verifyNotNegative(page, "page");

  return {
    meta: {
      total: count,
      total_pages: Math.ceil(count / limit),
      current_page: page,
      page_size: limit,
    },
    data: rows,
  };
};

export default buildPaginationMeta;
