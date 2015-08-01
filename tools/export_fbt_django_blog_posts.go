package main

import (
	"bytes"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"time"

	_ "github.com/lib/pq"
)

type queryer interface {
	Query(query string, params ...interface{}) (*sql.Rows, error)
}

/*
fbt=# select id, username, first_name, last_name from auth_user order by id;
 id | username | first_name |   last_name
----+----------+------------+----------------
  1 | paul     | Paul       | Smith
  2 | ben      | Ben        | Helphand
  3 | josh     | Josh       | Deth
  4 | andrew   | Andrew     | Vesselinovitch
  5 | intern   | FBT        | Intern
  6 | kati     | Kati       | Rooney
  7 | beth     | Beth       | White
(7 rows)

fbt=# \d blog_post
                                      Table "public.blog_post"
     Column      |           Type           |                       Modifiers
-----------------+--------------------------+--------------------------------------------------------
 id              | integer                  | not null default nextval('blog_post_id_seq'::regclass)
 author_id       | integer                  | not null
 title           | character varying(128)   | not null
 slug            | character varying(50)    | not null
 body            | text                     | not null
 create_date     | timestamp with time zone | not null
 pub_date        | timestamp with time zone | not null
 enable_comments | boolean                  | not null
 tags            | character varying(255)   | not null
 active          | boolean                  | default false
 permalink       | character varying(255)   |
*/

type post struct {
	id         int
	author     string
	title      string
	slug       string
	bodyHtml   string
	createDate time.Time
	pubDate    time.Time
	tags       string
	active     bool
}

func (p post) filename() string {
	return fmt.Sprintf("%s-%s.html", p.pubDate.Format("2006-01-02"), p.slug)
}

func (p post) permalink() string {
	return fmt.Sprintf("/blog/%s/%s/", p.pubDate.Format("2006/01/02"), p.slug)
}

func (p post) jekyll() []byte {
	f := new(bytes.Buffer)
	fmt.Fprintln(f, "---")
	fmt.Fprintln(f, "permalink:", p.permalink())
	fmt.Fprintln(f, "title:", p.title)
	fmt.Fprintln(f, "author:", p.author)
	fmt.Fprintln(f, "layout: post")
	published := "false"
	if p.active {
		published = "true"
	}
	fmt.Fprintln(f, "published:", published)
	if p.tags != "" {
		fmt.Fprintln(f, "tags:", p.tags)
	}
	fmt.Fprintln(f, "---")
	fmt.Fprintln(f, p.bodyHtml)
	return f.Bytes()
}

func blogPosts(db queryer) []post {
	rows, err := db.Query(`
	SELECT p.id, a.first_name || ' ' || a.last_name, title, slug, body, create_date, pub_date, tags, active
	FROM blog_post p, auth_user a
	WHERE p.author_id = a.id
	ORDER BY pub_date desc`)
	checkErr(err)
	var posts []post
	for rows.Next() {
		var post post
		dest := []interface{}{
			&post.id,
			&post.author,
			&post.title,
			&post.slug,
			&post.bodyHtml,
			&post.createDate,
			&post.pubDate,
			&post.tags,
			&post.active,
		}
		checkErr(rows.Scan(dest...))
		posts = append(posts, post)
	}
	checkErr(rows.Err())
	return posts
}

func exportPosts(posts []post) {
	for _, post := range posts {
		f, err := os.Create(filepath.Join("_posts", post.filename()))
		checkErr(err)
		defer f.Close()
		_, err = f.Write(post.jekyll())
		checkErr(err)
	}
}

func main() {
	db, err := sql.Open("postgres", "sslmode=disable")
	checkErr(err)

	posts := blogPosts(db)
	exportPosts(posts)
}

func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}
