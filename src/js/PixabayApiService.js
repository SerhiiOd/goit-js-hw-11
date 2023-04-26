import axios from 'axios';

export default class PixabayApiService {
  static BASE_URL = 'https://pixabay.com/api/';
  static KEY = '35615645-417b36a892fa045cf3834200a';

  constructor() {
    this.query = '';
    this.page = 1;
  }

  async getPhotos() {
    const url = `${PixabayApiService.BASE_URL}?key=${PixabayApiService.KEY}&q=${this.query}&per_page=40&page=${this.page}`;

    const { data } = await axios.get(url, {
      params: {
        image_type: 'photo',
        orientation: 'horizontal',
      },
    });

    this.incrementPage();

    let pages = Math.ceil(data.totalHits / data.hits.length);
    this.totalPages = pages;

    return data;
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  get currentPage() {
    return this.page;
  }

  set currentPage(value) {
    this.page = value;
  }

  get allPages() {
    return this.totalPages;
  }

  set allPages(value) {
    this.totalPages = value;
  }
}
