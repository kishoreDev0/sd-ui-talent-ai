import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MajorSkill, MajorSkillState } from '../types/majorSkillTypes';
import {
  createMajorSkillAsync,
  deleteMajorSkillAsync,
  fetchMajorSkillById,
  fetchMajorSkills,
  updateMajorSkillAsync,
} from '../actions/majorSkillActions';

const initialState: MajorSkillState = {
  items: [],
  isLoading: false,
  error: null,
  selectedMajorSkill: null,
};

const majorSkillSlice = createSlice({
  name: 'majorSkill',
  initialState,
  reducers: {
    clearMajorSkillError(state) {
      state.error = null;
    },
    setSelectedMajorSkill(state, action: PayloadAction<MajorSkill | null>) {
      state.selectedMajorSkill = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMajorSkills.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMajorSkills.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchMajorSkills.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload ?? action.error.message ?? '');
      })
      .addCase(fetchMajorSkillById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMajorSkillById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedMajorSkill = action.payload;
        const exists = state.items.some(
          (item) => item.id === action.payload.id,
        );
        if (!exists) {
          state.items.push(action.payload);
        }
      })
      .addCase(fetchMajorSkillById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload ?? action.error.message ?? '');
      })
      .addCase(createMajorSkillAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMajorSkillAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createMajorSkillAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload ?? action.error.message ?? '');
      })
      .addCase(updateMajorSkillAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMajorSkillAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        );
        if (
          state.selectedMajorSkill &&
          state.selectedMajorSkill.id === action.payload.id
        ) {
          state.selectedMajorSkill = action.payload;
        }
      })
      .addCase(updateMajorSkillAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload ?? action.error.message ?? '');
      })
      .addCase(deleteMajorSkillAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMajorSkillAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (
          state.selectedMajorSkill &&
          state.selectedMajorSkill.id === Number(action.payload)
        ) {
          state.selectedMajorSkill = null;
        }
      })
      .addCase(deleteMajorSkillAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload ?? action.error.message ?? '');
      });
  },
});

export const { clearMajorSkillError, setSelectedMajorSkill } =
  majorSkillSlice.actions;

export default majorSkillSlice.reducer;
