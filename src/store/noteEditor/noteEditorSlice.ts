import { createSlice } from "@reduxjs/toolkit";
import { FileNode } from "../fileTree/fileTreeSlice";

import { RootState } from "..";

interface InitialState {
  value: { id: number | string; name: string; content: string }[];
  activeID: string | number;
}

const initialState: InitialState = {
  value: [],
  activeID: "",
};

const noteEditorSlice = createSlice({
  name: "editorTabBar",
  initialState,
  reducers: {
    setActiveID(state, action: { payload: string | number }) {
      state.activeID = action.payload;
    },
    openFile(state, action: { payload: FileNode }) {
      if (state.value.findIndex((item) => item.id === action.payload.id) < 0) {
        state.value.push(action.payload);
      }
      state.activeID = action.payload.id;
    },
    closeFile(state, action: { payload: { id: number | string } }) {
      // find the index of the element with the id
      const index = state.value.findIndex(
        (item) => item.id === action.payload.id
      );

      // remove the element from the array
      if (index > -1) {
        state.value.splice(index, 1);
      }

      // if the closed file is the active one, find a new active file
      if (action.payload.id === state.activeID) {
        // only if the array isn't empty
        if (state.value.length > 0) {
          state.activeID = state.value[index === 0 ? index : index - 1].id;
        }
      }

      // if the array is empty, set the active index to nothing
      if (state.value.length < 1) {
        state.activeID = "";
      }
    },
  },
});

export const selectNoteEditorFiles = (state: RootState) =>
  state.noteEditor.value;

export const selectNoteEditorActiveID = (state: RootState) =>
  state.noteEditor.activeID;

export const selectNoteEditorActiveFile = (state: RootState) =>
  state.noteEditor.value[
    state.noteEditor.value.findIndex(
      (item) => item.id === state.noteEditor.activeID
    )
  ];

export const noteEditorActions = noteEditorSlice.actions;

export default noteEditorSlice.reducer;
