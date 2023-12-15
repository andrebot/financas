import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';

/**
 * This do an automatic typing of the dispatch and selector of this application
 * making the whole thing easier so we do not have be typing things
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
