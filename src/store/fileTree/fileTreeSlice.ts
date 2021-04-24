import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";
import { v4 as uuid } from "uuid";
import { fetchCount } from "./fileTreeAPI";

export type Node = {
  id: string | number;
  name: string;
};
export type FileNode = Node & {
  content: string;
};
export type FolderNode = Node & {
  children: (FolderNode | FileNode)[];
};

function isNode(x: FileNode | Node | FolderNode): x is Node {
  return (
    (typeof (x as Node).id === "number" ||
      typeof (x as Node).id === "string") &&
    typeof (x as Node).name === "string"
  );
}

export function isFileNode(x: FileNode | Node): x is FileNode {
  return typeof (x as FileNode).content === "string" && isNode(x);
}

export function isFolderNode(x: FileNode | FolderNode | Node): x is FolderNode {
  return (x as FolderNode).children instanceof Array && isNode(x);
}

export interface FileTreeState {
  value: FolderNode;
  status: "idle" | "loading" | "failed";
}

const initialState: FileTreeState = {
  value: {
    id: uuid(),
    name: "Root",
    children: [
      {
        id: uuid(),
        name: "Folder 1",
        children: [
          { id: uuid(), name: "File 1", content: "# File 1" },
          { id: uuid(), name: "File 2", content: "# File 2" },
        ],
      },
      {
        id: uuid(),
        name: "Folder 2",
        children: [
          { id: uuid(), name: "File 3", content: "# File 3" },
          { id: uuid(), name: "File 4", content: "# File 4" },
        ],
      },
    ],
  },
  status: "idle",
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const incrementAsync = createAsyncThunk(
  "fileTree/fetchCount",
  async (amount: number) => {
    const response = await fetchCount(amount);
    // The value we return becomes the `fulfilled` action payload
    return response.data;
  }
);

export const fileTreeSlice = createSlice({
  name: "counter",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    renameNode(state, action: { payload: Node }) {
      let foundNode = false;
      const nodeStack: (Node | FileNode | FolderNode)[] = [state.value];

      if (state.value && state.value.children) {
        while (!foundNode && !(nodeStack.length < 1)) {
          const got = nodeStack.pop();
          if (got) {
            if (got.id === action.payload.id) {
              got.name = action.payload.name;
              break;
            }
            if (isFolderNode(got)) {
              nodeStack.push(...got.children);
            }
          }
        }
      }
    },
    deleteNode(state, action: { payload: Node }) {
      if (state.value && state.value.children) {
        for (const item of state.value.children) {
          if (item.id === action.payload.id) {
            item.name = action.payload.name;
          }
        }
      }
    },
    createFile(
      state,
      action: { payload: { name: string; inFolder: string | number } }
    ) {},
    createFolder(
      state,
      action: { payload: { name: string; inFolder: string | number } }
    ) {},
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(incrementAsync.pending, (state) => {
  //       state.status = "loading";
  //     })
  //     .addCase(incrementAsync.fulfilled, (state, action) => {
  //       state.status = "idle";
  //       state.value += action.payload;
  //     });
  // },
});

export const fileTreeActions = fileTreeSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectFileTree = (state: RootState) => state.fileTree.value;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// export const incrementIfOdd = (amount: number): AppThunk => (
//   dispatch,
//   getState
// ) => {
//   const currentValue = selectCount(getState());
//   if (currentValue % 2 === 1) {
//     dispatch(incrementByAmount(amount));
//   }
// };

export default fileTreeSlice.reducer;
