
import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, Clock, ArrowUpCircle, X } from 'lucide-react';
import { useLeads } from '@/contexts/LeadContext';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function SearchBar() {
  const { 
    filters,
    setFilters,
    searchHistory,
    addToSearchHistory,
    clearSearchHistory
  } = useLeads();
  
  const [focused, setFocused] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const recognition = useRef<SpeechRecognition | null>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognitionAPI();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      
      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setLocalSearch(transcript);
        handleSearch(transcript);
        setIsListening(false);
      };
      
      recognition.current.onerror = () => {
        setIsListening(false);
      };
      
      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognition.current) {
        recognition.current.abort();
      }
    };
  }, []);
  
  // Update suggestions based on input
  useEffect(() => {
    if (localSearch && focused) {
      // Filter search history for matches
      const matchedHistory = searchHistory.filter(term => 
        term.toLowerCase().includes(localSearch.toLowerCase())
      );
      
      setSuggestions(matchedHistory);
    } else {
      setSuggestions([]);
    }
  }, [localSearch, focused, searchHistory]);
  
  const handleSearch = (term: string) => {
    setFilters({ ...filters, search: term });
    if (term) {
      addToSearchHistory(term);
    }
  };
  
  const startListening = () => {
    if (recognition.current) {
      try {
        recognition.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };
  
  const stopListening = () => {
    if (recognition.current) {
      recognition.current.stop();
      setIsListening(false);
    }
  };
  
  const clearSearch = () => {
    setLocalSearch('');
    setFilters({ ...filters, search: '' });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Handle clicking outside the popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative w-full max-w-2xl">
      <Popover open={focused} onOpenChange={setFocused}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              "flex items-center h-10 w-full rounded-lg border border-input px-3 py-2 input-glass",
              "transition-shadow duration-200 focus-within:ring-1 focus-within:ring-primary/30 focus-within:shadow-sm",
              focused && "ring-1 ring-primary/30 shadow-sm"
            )}
          >
            <Search className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(localSearch);
                  setFocused(false);
                }
              }}
              onFocus={() => setFocused(true)}
              placeholder="Search leads..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              autoComplete="off"
            />
            
            {localSearch && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={clearSearch}
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Clear</span>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 ml-1 text-muted-foreground hover:text-foreground",
                isListening && "text-red-500 hover:text-red-600"
              )}
              onClick={isListening ? stopListening : startListening}
            >
              <Mic className="h-4 w-4" />
              <span className="sr-only">
                {isListening ? "Stop voice search" : "Start voice search"}
              </span>
            </Button>
          </div>
        </PopoverTrigger>
        
        <PopoverContent 
          ref={popoverRef}
          className="w-[calc(100%-16px)] p-0 shadow-lg" 
          align="center"
        >
          <div className="max-h-[300px] overflow-y-auto py-1">
            {suggestions.length > 0 ? (
              <ul className="py-1 text-sm">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>
                    <button
                      className="flex items-center w-full px-4 py-2 text-left hover:bg-secondary/50"
                      onClick={() => {
                        setLocalSearch(suggestion);
                        handleSearch(suggestion);
                        setFocused(false);
                      }}
                    >
                      <ArrowUpCircle className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            ) : searchHistory.length > 0 ? (
              <>
                <div className="flex items-center justify-between px-4 py-2 border-b">
                  <h3 className="text-xs font-medium text-muted-foreground">Recent searches</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs hover:bg-secondary"
                    onClick={clearSearchHistory}
                  >
                    Clear all
                  </Button>
                </div>
                <ul className="py-1 text-sm">
                  {searchHistory.slice(0, 5).map((term, index) => (
                    <li key={index}>
                      <button
                        className="flex items-center w-full px-4 py-2 text-left hover:bg-secondary/50"
                        onClick={() => {
                          setLocalSearch(term);
                          handleSearch(term);
                          setFocused(false);
                        }}
                      >
                        <Clock className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                Type to search or use voice search
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Voice search feedback indicator */}
      {isListening && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg p-3 shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-ping" />
            <span className="text-sm">Listening...</span>
          </div>
        </div>
      )}
    </div>
  );
}
