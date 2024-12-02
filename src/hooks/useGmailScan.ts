import { useAppDispatch } from './useAppDispatch';
import { useSelector } from 'react-redux';
import { fetchGmailSubscriptions } from '../store/slices/gmailSlice';
import { RootState } from '../store';
import toast from 'react-hot-toast';

export const useGmailScan = () => {
  const dispatch = useAppDispatch();
  const { subscriptions, loading, error } = useSelector(
    (state: RootState) => state.gmail
  );

  const scanEmails = async (accessToken: string) => {
    try {
      await dispatch(fetchGmailSubscriptions(accessToken)).unwrap();
      toast.success('Successfully scanned Gmail for subscriptions');
    } catch (error) {
      toast.error('Failed to scan Gmail');
      console.error('Gmail scan error:', error);
    }
  };

  return {
    subscriptions,
    isLoading: loading,
    error,
    scanEmails
  };
};