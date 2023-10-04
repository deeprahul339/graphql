const express=require('express');
const  expressGraphQL=require('express-graphql').graphqlHTTP;
const {GraphQLSchema,GraphQLObjectType, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLInt}=require('graphql');
const app=express();

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const AuthorType=new GraphQLObjectType({
    name:'Author',
    description:'this represents a author of  a book',
    fields:()=>({
        id:{type: new GraphQLNonNull(GraphQLInt)},
        name:{type:GraphQLNonNull(GraphQLString)},
        authorId:{type: new GraphQLNonNull(GraphQLInt)},
        book:{
            type:new GraphQLList(BookType),
            resolve:(author)=>{
                return  books.filter(book=>book.authorId===author.id)
            }
        }
    
    })
})

const BookType=new GraphQLObjectType({
    name:'Book',
    description:'this represents  a  book written by an author',
    fields:()=>({
        id:{type: new GraphQLNonNull(GraphQLInt)},
        name:{type:GraphQLNonNull(GraphQLString)},
        authorId:{type: new GraphQLNonNull(GraphQLInt)},
        author:{
            type:AuthorType,
        resolve:(book)=>{
            return  authors.find(author=>author.id===book.authorId)
        }}


    })
})

const  RootQueryType=new GraphQLObjectType({
    name:'Query',
    description:'Root Query',
    //to  get a  single book with id
    fields:()=>({
    book:{
         type:BookType,
         description:'A  single book',
         args:{
        id:{
        type:GraphQLInt
        }},
         resolve:(parent,args)=>books.find(book=>book.id===args.id)
        },  
        // to get single author with id
         author:{
            type:AuthorType,
            description:'A  single author',
            args:{
                id:{type:GraphQLInt}
            },
            resolve:(parent,args)=>authors.find(author=>author.id===args.id)
        },
        books:{
            type:new  GraphQLList(BookType),
            description:'List of  all books',
            resolve:()=>books
        },
       
        authors:{
            type:new GraphQLList(AuthorType),
            description:'List of  all authors',
            resolve:()=>authors
        },
     
    })
})

const RootMutationType=new GraphQLObjectType({
    name:"Mutation",
    description:'Root Mutation',
    fields:()=>({
        addBook:{
            type:BookType,
            description:'Add a  book',
            args:{
               name:{ type:GraphQLNonNull(GraphQLString)},
            authorId:{type:GraphQLNonNull(GraphQLInt)}
        },
        resolve:(parent,args)=>{
            const book={id:books.length+1,name:args.name,
            authorId:args.authorId}
            books.push(book)
            return book
        }

        },
        //update book  based  on id
        updateBook:{
            type:BookType,
            description:'Add a  book',
            args:{
               name:{ type:GraphQLNonNull(GraphQLString)},
            id:{type:GraphQLNonNull(GraphQLInt)}
        },
        resolve:(parent,args)=>{
            const {id,name}=args;
           const bookToBeUpdated =books.find(book=>book.id===id);

           if(!bookToBeUpdated){
            throw new Error(`Item with ${id} not found`)
           }
        bookToBeUpdated.name=name;
            return bookToBeUpdated
        }

        },
        addAuthor:{
            type:AuthorType,
            description:'Add an author',
            args:{
               name:{ type:GraphQLNonNull(GraphQLString)},     
        },
        resolve:(parent,args)=>{
            const author={id:authors.length+1,name:args.name,}
            authors.push(author)
            return author
        }

        }
    })
})

const schema=new GraphQLSchema({
    query:RootQueryType,
    mutation:RootMutationType
})

app.use('/graphql',expressGraphQL({
    schema:schema,
    graphiql:true,
}))
app.listen(5000,()=>{console.log("server running")})