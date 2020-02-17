# Query

Redesign of `ViewQuery` and `ContentQuery` to be more flexible and easier to understand.


## Goals

- Focus on Component view only.
  - Content will be dealt with content projection.
- The solution should be imperative to have highest level of flexibility.
  - We need one off query solution?
  - We need constant update query solution?

## Mental Model

- Based `#ref` tags in the component template. (Developer owns both the component query as well as the template)
- Have a lifecycle hook when structure changes so that we know to re-query. 
  - Other way to solve this is with subscriptions, but those are expensive to set up and expensive to manage. Having lifecycle hook is cheaper/simpler.


## Why Content Query is different

- Developer that owns the Component view does not own the content view. Hence `#ref`s are not a good way to do this since it creates yet another way by which implementation details of component leak to the user.