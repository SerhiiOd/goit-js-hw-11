import PixabayApiService from './PixabayApiService';
import LoadMoreBtn from './LoadMoreBtn';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  divEl: document.querySelector('.gallery'),
  formEl: document.querySelector('.search-form'),
};

let totalPictures = 0;

const pixabayApiService = new PixabayApiService();
const loadMoreBtn = new LoadMoreBtn({
  selector: '#loadMore',
  isHidden: true,
});

const gallerySimpleLightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

refs.formEl.addEventListener('submit', onSearchSubmit);
loadMoreBtn.button.addEventListener('click', onLoadPage);

function onSearchSubmit(e) {
  e.preventDefault();
  loadMoreBtn.show();
  const query = e.currentTarget.elements.searchQuery.value.trim();
  if (query === '') {
    Notify.failure('It cannot be empty field');
    loadMoreBtn.hide();
    return;
  }
  pixabayApiService.query = query;
  pixabayApiService.resetPage();
  clearPhotosList();
  fetchPhotos().finally(() => {
    if (totalPictures != 0) Notify.success(`Hooray we found ${totalPictures}`);
    form.reset();
    return;
  });
}

async function fetchPhotos() {
  loadMoreBtn.disable();
  try {
    const markup = await getPhotosMarkup();
    updatePhotosList(markup);
    loadMoreBtn.enable();
  } catch (err) {
    onError(err);
  }
}

async function getPhotosMarkup() {
  try {
    const { hits, totalHits } = await pixabayApiService.getPhotos();

    if (hits.length === 0) {
      Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      loadMoreBtn.hide();
      return;
    }

    totalPictures = totalHits;

    return hits.reduce((markup, hit) => markup + createMarkup(hit), '');
  } catch (err) {
    onError(err);
  }
}

function createMarkup({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) {
  return `
  <div class="photo-card">
  <a href="${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  </a>
  <div class="info">
    <p class="info-item">
      <b>Likes: ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views: ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments: ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads: ${downloads}</b>
    </p>
  </div>
</div>`;
}

function updatePhotosList(markup) {
  if (pixabayApiService.query === '') {
    return loadMoreBtn.hide();
  }
  if (markup !== undefined) refs.divEl.insertAdjacentHTML('beforeend', markup);
  gallerySimpleLightbox.refresh();
}

function clearPhotosList() {
  refs.divEl.innerHTML = '';
}

function onLoadPage() {
  let currentPage = pixabayApiService.currentPage;
  let totalPages = pixabayApiService.allPages;

  if (currentPage > totalPages) {
    Notify.failure("We're sorry, but you've reached the end of search results.");
    loadMoreBtn.hide();
  } else {
    fetchPhotos();
    return;
  }
}

function lowScroll() {
  const { height } = refs.divEl.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function onError(err) {
  console.error(err);
  loadMoreBtn.hide();
  clearPhotosList();
  updatePhotosList('<p>Not found!</p>');
}
