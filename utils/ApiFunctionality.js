class ApiFunctionality {
  constructor(query, querystr) {
    (this.query = query), (this.querystr = querystr);
  }

  search() {
    let keyword = {};

    if (this.querystr.keyword) {
      keyword.$or = [
        {
          name: {
            $regex: this.querystr.keyword,
            $options: "i",
          },
        },
        {
          description: {
            $regex: this.querystr.keyword,
            $options: "i",
          },
        },
      ];

      const numberInKeyword = this.querystr.keyword.match(/\d+/);

      if (numberInKeyword) {
        keyword.$or.push({
          price: { $gte: Number(numberInKeyword[0]) },
        });
      }
    }

    this.query = this.query.find({ ...keyword });

    return this;
  }

  filter() {
    const queryCopy = { ...this.querystr };
    const removeFields = ["keyword", "page", "limit"];

    removeFields.forEach((key) => delete queryCopy[key]);

    this.query = this.query.find(queryCopy);
    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.querystr.page) || 1;
    const skip = resultPerPage * (currentPage - 1);
    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }
}

export default ApiFunctionality;
