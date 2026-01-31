import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useLanguage } from '../../context/LanguageContext';
import { useAdvancedChat } from '../../context/AdvancedChatContext';
import { Smile, Sticker, Image as ImageIcon, Search } from 'lucide-react';

const StickersGifsPanel = ({ onSelect }) => {
  const { t } = useLanguage();
  const { stickers, gifs } = useAdvancedChat();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGifs = gifs.filter(gif => 
    gif.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant=\"ghost\" size=\"sm\" className=\"h-9 w-9 p-0\">
          <Sticker className=\"w-4 h-4 text-slate-600\" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=\"w-80 p-2\" side=\"top\">
        <Tabs defaultValue=\"stickers\">
          <TabsList className=\"grid w-full grid-cols-2 mb-2\">
            <TabsTrigger value=\"stickers\" className=\"gap-2\">
              <Smile className=\"w-4 h-4\" />
              {t('ملصقات', 'Stickers')}
            </TabsTrigger>
            <TabsTrigger value=\"gifs\" className=\"gap-2\">
              <ImageIcon className=\"w-4 h-4\" />
              GIFs
            </TabsTrigger>
          </TabsList>

          <TabsContent value=\"stickers\" className=\"mt-2\">
            <div className=\"grid grid-cols-4 gap-2\">
              {stickers.map(sticker => (
                <button
                  key={sticker.id}
                  onClick={() => onSelect({ type: 'sticker', data: sticker })}
                  className=\"p-3 hover:bg-slate-100 rounded-lg transition-colors text-4xl\"
                >
                  {sticker.emoji}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value=\"gifs\" className=\"mt-2\">
            <div className=\"mb-2\">
              <div className=\"relative\">
                <Search className=\"absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400\" />
                <Input
                  placeholder={t('بحث GIF...', 'Search GIF...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className=\"pl-8 h-8 text-sm\"
                />
              </div>
            </div>
            <div className=\"grid grid-cols-2 gap-2 max-h-60 overflow-y-auto\">
              {filteredGifs.map(gif => (
                <button
                  key={gif.id}
                  onClick={() => onSelect({ type: 'gif', data: gif })}
                  className=\"relative aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity\"
                >
                  <img 
                    src={gif.thumbnail} 
                    alt={gif.title}
                    className=\"w-full h-full object-cover\"
                  />
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default StickersGifsPanel;
