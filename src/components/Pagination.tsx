import styles from "@/components/css/pagination.module.css"

export default function Pagination({ items, pageSize, currentPage, onPageChange }: {items: any, pageSize: number, currentPage: number, onPageChange: any}){
    const pagesCount = Math.ceil(items / pageSize);
    if (pagesCount === 1) return null;
    const pages = Array.from({ length: pagesCount }, (_, i) => i + 1);
    console.log(pages)
    return (
        <>
        <div>
     <ul className={`${styles.pagination}`}>
       {pages.map((page) => (
         <li
           key={page}
           className={
             page === currentPage ? styles.pageItemActive : styles.pageItem
           }
         >
           <a className={`${styles.pageLink} mx-2`} onClick={() => onPageChange(page)}>
             {page}
           </a>
         </li>
       ))}
     </ul>
   </div>
        </>
      )
}

export const paginate = (items:any, pageNumber:number, pageSize:number) => {
    const startIndex = (pageNumber - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
   };