import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { gmailService } from '../../services/gmail';
import { ParsedSubscription } from '../../types';

interface GmailState {
  subscriptions: ParsedSubscription[];
  loading: boolean;
  error: string | null;
}

const initialState: GmailState = {
  subscriptions: [],
  loading: false,
  error: null,
};

export const fetchGmailSubscriptions = createAsyncThunk(
  'gmail/fetchSubscriptions',
  async (accessToken: string) => {
    const subscriptions = await gmailService.getSubscriptionEmails(accessToken);
    return subscriptions.filter((sub): sub is ParsedSubscription => sub !== null);
  }
);

const gmailSlice = createSlice({
  name: 'gmail',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGmailSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGmailSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload;
      })
      .addCase(fetchGmailSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch subscriptions';
      });
  },
});

export default gmailSlice.reducer;