import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState } from './reducer/index';

// Use any for AppDispatch as the store configuration isn't available here
// Components importing from '@/store' will work correctly
export const useAppDispatch = () => useDispatch<any>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
