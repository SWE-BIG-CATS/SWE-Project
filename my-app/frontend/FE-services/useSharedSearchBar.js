import { useCallback, useEffect, useState } from 'react';
import {
    getTagSuggestions,
    getUserSuggestions,
    normalizeSelectedTag,
    shouldShowSuggestions,
} from '@/FE-services/search.service';

export function parseTagParam(tagParam) {
    if (!tagParam) return [];

    return String(tagParam)
        .split(',')
        .map((tag) => normalizeSelectedTag(tag))
        .filter(Boolean);
}

export function buildTagParam(tags) {
    if (!Array.isArray(tags) || tags.length === 0) return '';
    return tags
        .map((tag) => normalizeSelectedTag(tag))
        .filter(Boolean)
        .join(',');
}

export function useSharedSearchBar({
                                       initialQuery = '',
                                       initialTags = [],
                                       debounceMs = 300,
                                   } = {}) {
    const [draftQuery, setDraftQuery] = useState(initialQuery);
    const [selectedDraftTags, setSelectedDraftTags] = useState(
        Array.isArray(initialTags) ? initialTags : []
    );

    const [userSuggestions, setUserSuggestions] = useState([]);
    const [tagSuggestions, setTagSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);

    const resetDraftState = useCallback(() => {
        setDraftQuery('');
        setSelectedDraftTags([]);
        setUserSuggestions([]);
        setTagSuggestions([]);
        setShowSuggestions(false);
        setSuggestionsLoading(false);
    }, []);

    const clearSuggestions = useCallback(() => {
        setUserSuggestions([]);
        setTagSuggestions([]);
        setShowSuggestions(false);
        setSuggestionsLoading(false);
    }, []);

    useEffect(() => {
        if (!shouldShowSuggestions(draftQuery)) {
            clearSuggestions();
            return;
        }

        let cancelled = false;

        const timeoutId = setTimeout(async () => {
            try {
                setSuggestionsLoading(true);

                const [users, tags] = await Promise.all([
                    getUserSuggestions(draftQuery),
                    getTagSuggestions(draftQuery, selectedDraftTags),
                ]);

                if (cancelled) return;

                setUserSuggestions(users);
                setTagSuggestions(tags);
                setShowSuggestions(users.length > 0 || tags.length > 0);
            } catch (error) {
                if (cancelled) return;
                clearSuggestions();
            } finally {
                if (!cancelled) {
                    setSuggestionsLoading(false);
                }
            }
        }, debounceMs);

        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };
    }, [draftQuery, selectedDraftTags, debounceMs, clearSuggestions]);

    const handleChangeText = useCallback(
        (text) => {
            setDraftQuery(text);

            if (!text.trim() && selectedDraftTags.length === 0) {
                clearSuggestions();
            }
        },
        [selectedDraftTags.length, clearSuggestions]
    );

    const handleTagPress = useCallback((tag) => {
        const normalized = normalizeSelectedTag(tag?.slug || tag?.name);
        if (!normalized) return;

        setSelectedDraftTags((prev) => {
            if (prev.includes(normalized)) return prev;
            return [...prev, normalized];
        });

        setDraftQuery('');
        setUserSuggestions([]);
        setTagSuggestions([]);
        setShowSuggestions(false);
    }, []);

    const handleRemoveTag = useCallback((tagToRemove) => {
        setSelectedDraftTags((prev) => prev.filter((tag) => tag !== tagToRemove));
    }, []);

    const dismissSuggestions = useCallback(() => {
        setShowSuggestions(false);
    }, []);

    const hydrateDraftState = useCallback((nextQuery = '', nextTags = []) => {
        setDraftQuery(nextQuery);
        setSelectedDraftTags(Array.isArray(nextTags) ? nextTags : []);
        setUserSuggestions([]);
        setTagSuggestions([]);
        setShowSuggestions(false);
        setSuggestionsLoading(false);
    }, []);

    return {
        draftQuery,
        setDraftQuery,
        selectedDraftTags,
        setSelectedDraftTags,

        userSuggestions,
        tagSuggestions,
        showSuggestions,
        suggestionsLoading,

        handleChangeText,
        handleTagPress,
        handleRemoveTag,
        dismissSuggestions,
        clearSuggestions,
        resetDraftState,
        hydrateDraftState,
    };
}