
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Category, SubCategory } from '../types';
import { IconName } from '../utils/helpers';
// Fix: Removed non-existent runCategoryMigration from storageService imports
import { getCategories, getSubCategories, saveCategories as saveCategoriesToStorage, saveSubCategories as saveSubCategoriesToStorage, defaultCategories, defaultSubCategories } from '../services/storageService';
import { useNotification } from './NotificationContext';
import { useLanguage } from './LanguageContext';

interface CategoryContextType {
    categories: Category[];
    subCategories: SubCategory[];
    addCategory: (name: string, icon: IconName) => void;
    updateCategory: (id: string, name: string, icon: IconName) => void;
    deleteCategory: (id: string) => void;
    addSubCategory: (name: string, categoryId: string) => void;
    updateSubCategory: (id: string, name: string) => void;
    deleteSubCategory: (id: string) => void;
    getCategory: (id: string) => Category | undefined;
    getSubCategory: (id: string) => SubCategory | undefined;
    findCategoryByName: (name: string) => Category | undefined;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const { addToast } = useNotification();
    const { t } = useLanguage();

    useEffect(() => {
        const loadInitialData = async () => {
            const loadedCategories = await getCategories() || defaultCategories;
            setCategories(loadedCategories);

            const loadedSubCategories = await getSubCategories() || defaultSubCategories;
            setSubCategories(loadedSubCategories);
        };

        loadInitialData();
    }, []);

    const saveCategories = async (newCategories: Category[]) => {
        setCategories(newCategories);
        await saveCategoriesToStorage(newCategories);
    };

    const saveSubCategories = async (newSubCategories: SubCategory[]) => {
        setSubCategories(newSubCategories);
        await saveSubCategoriesToStorage(newSubCategories);
    };

    const addCategory = (name: string, icon: IconName) => {
        saveCategories([...categories, { id: uuidv4(), name, icon }]);
        addToast(t('notifications.categoryAdded'), "success");
    };
    const updateCategory = (id: string, name: string, icon: IconName) => {
        saveCategories(categories.map(c => c.id === id ? { ...c, name, icon } : c));
        addToast(t('notifications.categoryUpdated'), "success");
    };
    const deleteCategory = (id: string) => {
        if (id === 'cat-other') {
            addToast(t('notifications.categoryDeleteError'), "error");
            return;
        }
        if (window.confirm(t('profile.deleteCategoryConfirmation'))) {
            saveCategories(categories.filter(c => c.id !== id));
            saveSubCategories(subCategories.filter(sc => sc.categoryId !== id));
            addToast(t('notifications.categoryDeleted'), "success");
        }
    };
    
    const addSubCategory = (name: string, categoryId: string) => {
        saveSubCategories([...subCategories, { id: uuidv4(), name, categoryId }]);
        addToast(t('notifications.subCategoryAdded'), "success");
    };
    const updateSubCategory = (id: string, name: string) => {
        saveSubCategories(subCategories.map(sc => sc.id === id ? { ...sc, name } : sc));
        addToast(t('notifications.subCategoryUpdated'), "success");
    };
    const deleteSubCategory = (id: string) => {
        if (window.confirm(t('profile.deleteSubCategoryConfirmation'))) {
            saveSubCategories(subCategories.filter(sc => sc.id !== id));
            addToast(t('notifications.subCategoryDeleted'), "success");
        }
    };
    
    const getCategory = (id: string) => categories.find(c => c.id === id);
    const getSubCategory = (id: string) => subCategories.find(sc => sc.id === id);
    const findCategoryByName = (name: string) => categories.find(c => c.name.toLowerCase() === name.toLowerCase());

    const value = {
        categories, subCategories, addCategory, updateCategory, deleteCategory,
        addSubCategory, updateSubCategory, deleteSubCategory, getCategory, getSubCategory, findCategoryByName
    };

    return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
};

export const useCategories = (): CategoryContextType => {
    const context = useContext(CategoryContext);
    if (context === undefined) {
        throw new Error('useCategories must be used within a CategoryProvider');
    }
    return context;
};
