import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Skill, SkillState } from '../types/skillTypes';
import {
  createSkillAsync,
  deleteSkillAsync,
  fetchSkillById,
  fetchSkills,
  updateSkillAsync,
} from '../actions/skillActions';

const initialState: SkillState = {
  items: [],
  isLoading: false,
  error: null,
  selectedSkill: null,
};

const skillSlice = createSlice({
  name: 'skill',
  initialState,
  reducers: {
    clearSkillError(state) {
      state.error = null;
    },
    setSelectedSkill(state, action: PayloadAction<Skill | null>) {
      state.selectedSkill = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkills.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSkills.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload ?? action.error.message ?? '');
      })
      .addCase(fetchSkillById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSkillById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedSkill = action.payload;
        const exists = state.items.some(
          (item) => item.id === action.payload.id,
        );
        if (!exists) {
          state.items.push(action.payload);
        }
      })
      .addCase(fetchSkillById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload ?? action.error.message ?? '');
      })
      .addCase(createSkillAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSkillAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createSkillAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload ?? action.error.message ?? '');
      })
      .addCase(updateSkillAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSkillAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        );
        if (
          state.selectedSkill &&
          state.selectedSkill.id === action.payload.id
        ) {
          state.selectedSkill = action.payload;
        }
      })
      .addCase(updateSkillAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload ?? action.error.message ?? '');
      })
      .addCase(deleteSkillAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSkillAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (
          state.selectedSkill &&
          state.selectedSkill.id === Number(action.payload)
        ) {
          state.selectedSkill = null;
        }
      })
      .addCase(deleteSkillAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = String(action.payload ?? action.error.message ?? '');
      });
  },
});

export const { clearSkillError, setSelectedSkill } = skillSlice.actions;

export default skillSlice.reducer;
