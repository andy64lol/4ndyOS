// Shared file system for DeepBlueOS
class SharedFileSystem {
    constructor() {
        this.fileSystem = this.loadFileSystem() || this.createDefaultFileSystem();
        this.observers = [];
        this.clipboard = { item: null, operation: null };
    }

    createDefaultFileSystem() {
        return {
            '/': {
                type: 'directory',
                name: 'root',
                contents: {
                    'home': {
                        type: 'directory',
                        name: 'home',
                        contents: {
                            'user': {
                                type: 'directory',
                                name: 'user',
                                contents: {
                                    'Documents': {
                                        type: 'directory',
                                        name: 'Documents',
                                        contents: {
                                            'Welcome.txt': {
                                                type: 'file',
                                                name: 'Welcome.txt',
                                                size: 1234,
                                                modified: new Date().toISOString(),
                                                content: 'Welcome to DeepBlueOS!\n\nThis file system is shared between the Terminal and File Manager.\nChanges made in one app will be reflected in the other.'
                                            },
                                            'project-notes.md': {
                                                type: 'file',
                                                name: 'project-notes.md',
                                                size: 856,
                                                modified: new Date().toISOString(),
                                                content: '# Project Notes\n\n## Features\n- Shared file system\n- Terminal integration\n- File manager GUI\n\n## TODO\n- Add more commands\n- Improve UI'
                                            },
                                            'Scripts': {
                                                type: 'directory',
                                                name: 'Scripts',
                                                contents: {
                                                    'hello.py': {
                                                        type: 'file',
                                                        name: 'hello.py',
                                                        size: 234,
                                                        modified: new Date().toISOString(),
                                                        content: '#!/usr/bin/env python3\nprint("Hello from DeepBlueOS Terminal!")\nprint("File system is now shared between apps!")'
                                                    },
                                                    'list-files.sh': {
                                                        type: 'file',
                                                        name: 'list-files.sh',
                                                        size: 156,
                                                        modified: new Date().toISOString(),
                                                        content: '#!/bin/bash\necho "Files in current directory:"\nls -la\necho "Total files: $(ls -1 | wc -l)"'
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    'Downloads': {
                                        type: 'directory',
                                        name: 'Downloads',
                                        contents: {}
                                    },
                                    'Pictures': {
                                        type: 'directory',
                                        name: 'Pictures',
                                        contents: {}
                                    },
                                    'Music': {
                                        type: 'directory',
                                        name: 'Music',
                                        contents: {}
                                    },
                                    'Desktop': {
                                        type: 'directory',
                                        name: 'Desktop',
                                        contents: {}
                                    },
                                    '.bashrc': {
                                        type: 'file',
                                        name: '.bashrc',
                                        size: 512,
                                        modified: new Date().toISOString(),
                                        content: '# DeepBlueOS Terminal Configuration\nexport PS1="\\u@deepblueos:\\w$ "\nalias ll="ls -la"\nalias la="ls -A"\nalias l="ls -CF"\n\necho "Welcome to DeepBlueOS Terminal!"'
                                    }
                                }
                            }
                        }
                    },
                    'bin': {
                        type: 'directory',
                        name: 'bin',
                        contents: {}
                    },
                    'etc': {
                        type: 'directory',
                        name: 'etc',
                        contents: {}
                    },
                    'var': {
                        type: 'directory',
                        name: 'var',
                        contents: {
                            'log': {
                                type: 'directory',
                                name: 'log',
                                contents: {}
                            }
                        }
                    },
                    'tmp': {
                        type: 'directory',
                        name: 'tmp',
                        contents: {}
                    }
                }
            }
        };
    }

    // Observer pattern for synchronization
    addObserver(observer) {
        this.observers.push(observer);
    }

    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notifyObservers(event, path, data = null) {
        this.observers.forEach(observer => {
            if (observer.onFileSystemChange) {
                observer.onFileSystemChange(event, path, data);
            }
        });
    }

    // Path utilities
    normalizePath(path) {
        if (!path || path === '') return '/';
        if (!path.startsWith('/')) path = '/' + path;
        return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
    }

    resolvePath(currentDir, targetPath) {
        if (!targetPath) return currentDir;
        
        if (targetPath.startsWith('/')) {
            return this.normalizePath(targetPath);
        }
        
        const parts = currentDir.split('/').filter(p => p);
        const targetParts = targetPath.split('/').filter(p => p);
        
        for (const part of targetParts) {
            if (part === '..') {
                parts.pop();
            } else if (part !== '.') {
                parts.push(part);
            }
        }
        
        return '/' + parts.join('/');
    }

    // File system operations
    getItemAtPath(path) {
        path = this.normalizePath(path);
        const parts = path === '/' ? [] : path.split('/').filter(p => p);
        
        let current = this.fileSystem['/'];
        
        for (const part of parts) {
            if (!current || current.type !== 'directory' || !current.contents || !current.contents[part]) {
                return null;
            }
            current = current.contents[part];
        }
        
        return current;
    }

    createFile(path, name, content = '') {
        const dir = this.getItemAtPath(path);
        if (!dir || dir.type !== 'directory') {
            return { success: false, error: 'Directory not found' };
        }

        if (dir.contents[name]) {
            return { success: false, error: 'File already exists' };
        }

        dir.contents[name] = {
            type: 'file',
            name: name,
            size: content.length,
            modified: new Date().toISOString(),
            content: content
        };

        this.saveFileSystem();
        this.notifyObservers('create', `${path}/${name}`, dir.contents[name]);
        return { success: true };
    }

    createDirectory(path, name) {
        const dir = this.getItemAtPath(path);
        if (!dir || dir.type !== 'directory') {
            return { success: false, error: 'Directory not found' };
        }

        if (dir.contents[name]) {
            return { success: false, error: 'Directory already exists' };
        }

        dir.contents[name] = {
            type: 'directory',
            name: name,
            contents: {}
        };

        this.saveFileSystem();
        this.notifyObservers('create', `${path}/${name}`, dir.contents[name]);
        return { success: true };
    }

    deleteItem(path) {
        const pathParts = path.split('/').filter(p => p);
        const fileName = pathParts.pop();
        const dirPath = '/' + pathParts.join('/');
        
        const dir = this.getItemAtPath(dirPath);
        if (!dir || dir.type !== 'directory' || !dir.contents[fileName]) {
            return { success: false, error: 'Item not found' };
        }

        delete dir.contents[fileName];
        this.saveFileSystem();
        this.notifyObservers('delete', path);
        return { success: true };
    }

    renameItem(path, newName) {
        const pathParts = path.split('/').filter(p => p);
        const oldName = pathParts.pop();
        const dirPath = '/' + pathParts.join('/');
        
        const dir = this.getItemAtPath(dirPath);
        if (!dir || dir.type !== 'directory' || !dir.contents[oldName]) {
            return { success: false, error: 'Item not found' };
        }

        if (dir.contents[newName]) {
            return { success: false, error: 'Name already exists' };
        }

        const item = dir.contents[oldName];
        item.name = newName;
        dir.contents[newName] = item;
        delete dir.contents[oldName];

        this.saveFileSystem();
        this.notifyObservers('rename', path, { oldName, newName });
        return { success: true };
    }

    writeFile(path, content) {
        const item = this.getItemAtPath(path);
        if (!item) {
            return { success: false, error: 'File not found' };
        }

        if (item.type !== 'file') {
            return { success: false, error: 'Not a file' };
        }

        item.content = content;
        item.size = content.length;
        item.modified = new Date().toISOString();

        this.saveFileSystem();
        this.notifyObservers('modify', path, item);
        return { success: true };
    }

    readFile(path) {
        const item = this.getItemAtPath(path);
        if (!item) {
            return { success: false, error: 'File not found' };
        }

        if (item.type !== 'file') {
            return { success: false, error: 'Not a file' };
        }

        return { success: true, content: item.content };
    }

    listDirectory(path) {
        const dir = this.getItemAtPath(path);
        if (!dir) {
            return { success: false, error: 'Directory not found' };
        }

        if (dir.type !== 'directory') {
            return { success: false, error: 'Not a directory' };
        }

        const items = Object.keys(dir.contents).map(name => ({
            name,
            ...dir.contents[name]
        }));

        return { success: true, items };
    }

    // Storage
    saveFileSystem() {
        try {
            localStorage.setItem('deepblueos-filesystem', JSON.stringify(this.fileSystem));
        } catch (e) {
            console.warn('Failed to save file system:', e);
        }
    }

    loadFileSystem() {
        try {
            const saved = localStorage.getItem('deepblueos-filesystem');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.warn('Failed to load file system:', e);
            return null;
        }
    }

    // Calculate storage usage
    calculateStorageUsage() {
        const calculateSize = (item) => {
            if (item.type === 'file') {
                return item.size || item.content?.length || 0;
            } else if (item.type === 'directory' && item.contents) {
                return Object.values(item.contents).reduce((total, child) => total + calculateSize(child), 0);
            }
            return 0;
        };

        const totalSize = calculateSize(this.fileSystem['/']);
        const maxSize = 1024 * 1024 * 1024; // 1GB
        const usedMB = Math.round(totalSize / 1024 / 1024 * 100) / 100;
        const percentage = (totalSize / maxSize) * 100;

        return {
            used: totalSize,
            usedMB: usedMB,
            percentage: Math.min(percentage, 100),
            available: Math.max(0, maxSize - totalSize)
        };
    }
}

// Global instance
window.sharedFS = new SharedFileSystem();
