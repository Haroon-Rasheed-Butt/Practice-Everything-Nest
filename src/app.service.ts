import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  books = [
	{
  	id: 1,
  	title: 'The Hobbit',
  	author: 'J. R. R. Tolkien',
  	status: 'Checked-in',
	},
	{
  	id: 2,
  	title: 'Do Androids Dream of Electric Sheep?',
  	author: 'Philip K. Dick',
  	status: 'Checked-out',
	},
	{
  	id: 3,
  	title: 'Brave New World',
  	author: 'Aldous Huxley',
  	status: 'Checked-out',
	},
  ];

  getAllBooks(): any[] {    
	return this.books;
  }

  getBook(params: any): any {
	return this.books.filter((r) => r.id == params.id)[0];
  }

  updateBook(book: any): any {
	return book;
  }
}
