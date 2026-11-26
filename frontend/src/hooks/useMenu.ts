import { useEffect, useState } from 'react';
import { getMenu } from '../api/publicApi';
import { NavItem } from '../types/ui';
import { fixedLinks } from '../utils/navLinks';

type MenuStatus = 'loading' | 'error' | 'ready';

export function useMenu() {
  const [links, setLinks] = useState<NavItem[]>(fixedLinks);
  const [status, setStatus] = useState<MenuStatus>('loading');

  useEffect(() => {
    let active = true;
    getMenu()
      .then((menu) => {
        if (!active) return;
        const pageLinks = menu.map((item) => ({ to: `/${item.slug}`, label: item.menu_name }));
        setLinks([...fixedLinks, ...pageLinks]);
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, []);

  return { links, status };
}
