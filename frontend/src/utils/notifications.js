import toast from 'react-hot-toast';

export const notify = (title, body) => {
  toast(`${title}: ${body}`);
};
